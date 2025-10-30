import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom Hook for Client-Side Authentication
 *
 * Usage:
 * const { user, loading, logout } = useAuth();
 */

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  subscription_status: string;
  daily_limit: number;
  monthly_limit: number;
  daily_usage: number;
  monthly_usage: number;
  stripe_customer_id?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(requireAuth = false) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = localStorage.getItem('session');

      if (!session) {
        setState({ user: null, loading: false, error: null });
        if (requireAuth) {
          router.push('/login');
        }
        return;
      }

      const { access_token } = JSON.parse(session);

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState({ user: data.user, loading: false, error: null });
      } else {
        localStorage.removeItem('session');
        setState({ user: null, loading: false, error: 'Session expired' });
        if (requireAuth) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setState({ user: null, loading: false, error: 'Authentication failed' });
      if (requireAuth) {
        router.push('/login');
      }
    }
  };

  const logout = async () => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const { access_token } = JSON.parse(session);
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('session');
      setState({ user: null, loading: false, error: null });
      router.push('/');
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    logout,
    refreshUser,
    isAuthenticated: !!state.user,
  };
}
