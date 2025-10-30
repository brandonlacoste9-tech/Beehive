import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../src/lib/useAuth';

interface TeamMember {
  user_id: string;
  email: string;
  name?: string;
  role: 'admin' | 'member' | 'viewer';
  joined_at: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expires_at: string;
}

interface TeamData {
  team: {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    created_at: string;
    is_owner: boolean;
    your_role: string;
  } | null;
  members: TeamMember[];
  pendingInvites: PendingInvite[];
  analytics: {
    total_generations: number;
    total_members: number;
  };
}

export default function Team() {
  const { user, loading } = useAuth(true);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user]);

  const fetchTeamData = async () => {
    try {
      const session = localStorage.getItem('session');
      if (!session) return;

      const { token } = JSON.parse(session);

      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamData?.team || !inviteEmail) return;

    setInviting(true);

    try {
      const session = localStorage.getItem('session');
      if (!session) return;

      const { token } = JSON.parse(session);

      const response = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: teamData.team.id,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (response.ok) {
        alert('Invitation sent successfully!');
        setInviteEmail('');
        fetchTeamData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.plan !== 'enterprise') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Feature</h1>
          <p className="text-gray-600 mb-6">
            Team collaboration is only available on the Enterprise plan.
          </p>
          <a
            href="/pricing"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Upgrade to Enterprise
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Team - AdGenXAI</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {teamData?.team?.name || 'Your Team'}
          </h1>
          {teamData?.team?.description && (
            <p className="text-lg text-gray-600">{teamData.team.description}</p>
          )}
        </div>

        {/* Analytics */}
        {teamData?.team && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{teamData.analytics.total_members}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Team Generations</p>
              <p className="text-3xl font-bold text-blue-600">{teamData.analytics.total_generations}</p>
            </div>
          </div>
        )}

        {/* Invite Member */}
        {teamData?.team && teamData.team.your_role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Invite Team Member</h2>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={inviting}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>
          </div>
        )}

        {/* Team Members */}
        {teamData?.team && teamData.members.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Team Members</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Member</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.members.map((member) => (
                    <tr key={member.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-gray-900 font-medium">
                            {member.name || member.email.split('@')[0]}
                            {member.user_id === teamData.team?.owner_id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Owner
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          member.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : member.role === 'member'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Invites */}
        {teamData?.team && teamData.pendingInvites.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pending Invitations</h2>

            <div className="space-y-3">
              {teamData.pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-500">
                      Role: {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-yellow-600 text-sm font-medium">Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Team State */}
        {!teamData?.team && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Team Yet</h2>
            <p className="text-gray-600 mb-6">
              Create a team to start collaborating with your colleagues.
            </p>
            {/* Add create team form here if needed */}
          </div>
        )}
      </div>
    </div>
  );
}
