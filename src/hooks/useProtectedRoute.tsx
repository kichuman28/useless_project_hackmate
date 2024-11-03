// src/hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';

export const useProtectedRoute = () => {
  const { user, loading, onboardingCompleted } = useAuth();
  const router = useRouter();
  const currentPath = router.pathname;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!onboardingCompleted && currentPath !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [user, loading, onboardingCompleted, router, currentPath]);

  return { user, loading };
};

