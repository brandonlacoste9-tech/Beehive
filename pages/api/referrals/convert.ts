import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Convert Referral to Successful
 *
 * POST /api/referrals/convert
 * Body: { userId }
 *
 * Called when a referred user upgrades to a paid plan
 * Grants rewards to the referrer
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field',
        details: 'userId is required',
      });
    }

    // Find referral signup record
    const { data: signup, error: signupError } = await supabaseAdmin
      .from('referral_signups')
      .select('id, referrer_id, converted, reward_claimed')
      .eq('user_id', userId)
      .single();

    if (signupError || !signup) {
      return res.status(404).json({
        error: 'Referral not found',
        message: 'No referral record found for this user',
      });
    }

    // If already converted, skip
    if (signup.converted && signup.reward_claimed) {
      return res.status(200).json({
        success: true,
        message: 'Referral already converted',
      });
    }

    // Mark as converted
    await supabaseAdmin
      .from('referral_signups')
      .update({
        converted: true,
        reward_claimed: true,
        converted_at: new Date().toISOString(),
      })
      .eq('id', signup.id);

    // Get referrer's current referral data
    const { data: referral } = await supabaseAdmin
      .from('referrals')
      .select('successful_referrals, total_rewards')
      .eq('user_id', signup.referrer_id)
      .single();

    const successfulReferrals = (referral?.successful_referrals || 0) + 1;
    const rewardAmount = 100; // 100 bonus generations per successful referral

    // Update referrer's referral stats
    await supabaseAdmin
      .from('referrals')
      .update({
        successful_referrals: successfulReferrals,
        total_rewards: (referral?.total_rewards || 0) + rewardAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', signup.referrer_id);

    // Grant bonus generations to referrer
    const { data: referrerUser } = await supabaseAdmin
      .from('users')
      .select('bonus_generations')
      .eq('id', signup.referrer_id)
      .single();

    await supabaseAdmin
      .from('users')
      .update({
        bonus_generations: (referrerUser?.bonus_generations || 0) + rewardAmount,
      })
      .eq('id', signup.referrer_id);

    return res.status(200).json({
      success: true,
      message: 'Referral converted successfully',
      reward: rewardAmount,
    });
  } catch (error) {
    console.error('Convert referral error:', error);
    return res.status(500).json({
      error: 'Failed to convert referral',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
