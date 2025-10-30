import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Apply Referral Code
 *
 * POST /api/referrals/apply
 * Body: { code, newUserEmail, newUserId }
 *
 * Called after user signup to apply referral rewards
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, newUserEmail, newUserId } = req.body;

    if (!code || !newUserEmail || !newUserId) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'code, newUserEmail, and newUserId are required',
      });
    }

    // Find referrer by code
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .select('user_id, code, total_referrals')
      .eq('code', code.toUpperCase())
      .single();

    if (referralError || !referral) {
      return res.status(404).json({
        error: 'Invalid referral code',
        message: 'The referral code does not exist',
      });
    }

    // Check if this email has already been referred
    const { data: existingSignup } = await supabaseAdmin
      .from('referral_signups')
      .select('id')
      .eq('email', newUserEmail)
      .single();

    if (existingSignup) {
      return res.status(400).json({
        error: 'Already referred',
        message: 'This email has already used a referral code',
      });
    }

    // Record the referral signup
    await supabaseAdmin.from('referral_signups').insert({
      referrer_id: referral.user_id,
      email: newUserEmail,
      user_id: newUserId,
      converted: false,
      reward_claimed: false,
    });

    // Update referral stats
    await supabaseAdmin
      .from('referrals')
      .update({
        total_referrals: referral.total_referrals + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', referral.user_id);

    // Give bonus generations to new user (50 bonus for using referral code)
    await supabaseAdmin
      .from('users')
      .update({
        bonus_generations: 50,
        referred_by: referral.user_id,
      })
      .eq('id', newUserId);

    return res.status(200).json({
      success: true,
      message: 'Referral code applied successfully',
      bonus: 50,
    });
  } catch (error) {
    console.error('Apply referral error:', error);
    return res.status(500).json({
      error: 'Failed to apply referral code',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
