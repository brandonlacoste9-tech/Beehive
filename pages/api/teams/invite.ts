import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../src/lib/auth';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';
import { sendEmail } from '../../../src/lib/email';

/**
 * Invite Team Member
 *
 * POST /api/teams/invite
 * Body: { teamId, email, role }
 *
 * Roles: 'admin' | 'member' | 'viewer'
 */

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;
    const { teamId, email, role = 'member' } = req.body;

    if (!teamId || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'teamId and email are required',
      });
    }

    // Validate role
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        details: 'Role must be admin, member, or viewer',
      });
    }

    // Check if user is admin of the team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role, teams(name, owner_id)')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You must be a team admin to invite members',
      });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', email) // Assuming email lookup
      .single();

    if (existingMember) {
      return res.status(400).json({
        error: 'Already a member',
        message: 'This user is already a member of the team',
      });
    }

    // Create invite
    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invites')
      .insert({
        team_id: teamId,
        email,
        role,
        invited_by: user.id,
        invite_code: inviteCode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      throw inviteError;
    }

    // Send invitation email
    const teamName = (membership as any).teams?.name || 'the team';
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}/teams/accept?code=${inviteCode}`;

    await sendEmail({
      to: email,
      subject: `You've been invited to join ${teamName} on AdGenXAI`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Team Invitation</h2>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        You've been invited to join <strong>${teamName}</strong> on AdGenXAI as a <strong>${role}</strong>.
      </p>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Click the button below to accept the invitation:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}"
           style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0;">
        This invitation expires on ${expiresAt.toLocaleDateString()}.
      </p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} AdGenXAI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      invite: {
        id: invite.id,
        email,
        role,
        expires_at: invite.expires_at,
      },
    });
  } catch (error) {
    console.error('Team invite error:', error);
    return res.status(500).json({
      error: 'Failed to send invitation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < 32; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}
