'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This component watches the authentication state and redirects the user
 * to the dashboard if they are logged in. It renders nothing.
 */
export function AuthWatcher() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the initial user load is finished and we have a user,
    // it means they have just logged in. Redirect them.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [isUserLoading, user, router]);

  // This component does not render any UI
  return null;
}
