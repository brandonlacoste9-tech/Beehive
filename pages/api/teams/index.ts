import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../src/lib/auth';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Get Team Details
 *
 * GET /api/teams
 * Returns user's team and members
 */

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;

    // Find teams where user is a member
    const { data: memberships, error: membershipError } = await supabaseAdmin
      .from('team_members')
      .select(`
        role,
        joined_at,
        teams (
          id,
          name,
          description,
          owner_id,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (membershipError) {
      throw membershipError;
    }

    if (!memberships || memberships.length === 0) {
      return res.status(200).json({
        team: null,
        members: [],
      });
    }

    // Get the first team (users typically belong to one team)
    const membership = memberships[0];
    const team = (membership as any).teams;

    if (!team) {
      return res.status(200).json({
        team: null,
        members: [],
      });
    }

    // Get all team members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('team_members')
      .select(`
        user_id,
        role,
        joined_at,
        users (
          id,
          email,
          name
        )
      `)
      .eq('team_id', team.id)
      .order('joined_at', { ascending: true });

    if (membersError) {
      throw membersError;
    }

    // Get pending invites (if user is admin)
    let pendingInvites = [];
    if (membership.role === 'admin') {
      const { data: invites } = await supabaseAdmin
        .from('team_invites')
        .select('*')
        .eq('team_id', team.id)
        .eq('accepted', false)
        .gt('expires_at', new Date().toISOString());

      pendingInvites = invites || [];
    }

    // Get team analytics (generations count)
    const { data: generationsData } = await supabaseAdmin
      .from('generations')
      .select('id')
      .in('user_id', members?.map((m: any) => m.user_id) || []);

    return res.status(200).json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        owner_id: team.owner_id,
        created_at: team.created_at,
        is_owner: team.owner_id === user.id,
        your_role: membership.role,
      },
      members: members?.map((m: any) => ({
        user_id: m.user_id,
        email: m.users?.email,
        name: m.users?.name,
        role: m.role,
        joined_at: m.joined_at,
      })) || [],
      pendingInvites,
      analytics: {
        total_generations: generationsData?.length || 0,
        total_members: members?.length || 0,
      },
    });
  } catch (error) {
    console.error('Get team error:', error);
    return res.status(500).json({
      error: 'Failed to get team details',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);
