'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect('/login');
    }
  }, [isUserLoading, user]);

  if (isUserLoading || !user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className='flex flex-col items-center gap-4'>
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
