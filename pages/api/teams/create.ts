import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../src/lib/auth';
import { supabaseAdmin } from '../../../src/lib/supabaseAdmin';

/**
 * Create Team
 *
 * POST /api/teams/create
 * Body: { name, description }
 *
 * Enterprise plan required
 */

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;

    // Check if user has Enterprise plan
    if (user.plan !== 'enterprise') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Team collaboration is only available on Enterprise plan',
        upgrade_url: '/pricing',
      });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Missing required field',
        details: 'name is required',
      });
    }

    // Check if user already owns a team
    const { data: existingTeam } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (existingTeam) {
      return res.status(400).json({
        error: 'Team already exists',
        message: 'You already own a team. Please manage your existing team instead.',
      });
    }

    // Create team
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert({
        name,
        description,
        owner_id: user.id,
      })
      .select()
      .single();

    if (teamError) {
      throw teamError;
    }

    // Add owner as team member with admin role
    await supabaseAdmin.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'admin',
      invited_by: user.id,
    });

    return res.status(201).json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        created_at: team.created_at,
      },
    });
  } catch (error) {
    console.error('Create team error:', error);
    return res.status(500).json({
      error: 'Failed to create team',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);
