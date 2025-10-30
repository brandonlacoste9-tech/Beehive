import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../src/lib/auth';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Get or Generate Referral Code
 *
 * GET /api/referrals/code
 * Returns the user's referral code and stats
 */

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;

    // Get or create referral code
    let { data: referralData } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no referral code exists, create one
    if (!referralData) {
      const code = generateReferralCode();

      const { data: newReferral, error: insertError } = await supabaseAdmin
        .from('referrals')
        .insert({
          user_id: user.id,
          code,
          total_referrals: 0,
          successful_referrals: 0,
          total_rewards: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      referralData = newReferral;
    }

    // Get list of referred users
    const { data: referredUsers } = await supabaseAdmin
      .from('referral_signups')
      .select('email, created_at, converted, reward_claimed')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    return res.status(200).json({
      code: referralData.code,
      stats: {
        totalReferrals: referralData.total_referrals,
        successfulReferrals: referralData.successful_referrals,
        totalRewards: referralData.total_rewards,
      },
      referredUsers: referredUsers || [],
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}?ref=${referralData.code}`,
    });
  } catch (error) {
    console.error('Referral code error:', error);
    return res.status(500).json({
      error: 'Failed to get referral code',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}
