'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TiltlessLogo } from './TiltlessLogo';

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGate({ children, requireAuth = true }: AuthGateProps) {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isReady) {
      // Still loading, don't render anything yet
      setShouldRender(false);
      return;
    }

    // Privy is ready, now check auth state
    if (requireAuth) {
      // Protected route: need to be authenticated
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.replace('/login');
        setShouldRender(false);
      } else {
        // Authenticated, allow render
        setShouldRender(true);
      }
    } else {
      // Login page: should NOT be authenticated
      if (isAuthenticated && pathname === '/login') {
        // Already authenticated, redirect to home
        router.replace('/');
        setShouldRender(false);
      } else {
        // Not authenticated or not on login page, allow render
        setShouldRender(true);
      }
    }
  }, [isReady, isAuthenticated, requireAuth, router, pathname]);

  // Show branded loader while Privy initializes
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="mb-6 inline-block">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-brand-mint"></div>
          </div>
          <TiltlessLogo className="justify-center" />
          <div className="mt-2 text-sm text-white/40">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render if we're redirecting
  if (!shouldRender) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-bg"></div>
    );
  }

  return <>{children}</>;
}
