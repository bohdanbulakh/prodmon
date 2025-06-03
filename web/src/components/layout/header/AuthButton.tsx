'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AuthButton () {
  const { loggedIn, isLoading } = useAuthentication();
  const router = useRouter();
  const { logout } = useAuthActions();

  const { refetch } = useQuery({
    queryFn: logout,
    queryKey: ['logout'],
    enabled: false,
  });

  const handleClick = useCallback(async () => {
    if (isLoading) return;

    if (loggedIn) {
      try {
        await refetch();
        toast.success('Ви успішно вийшли з акаунту');
      } catch (error: any) {
        toast.error(error.message)
      }
    } else {
      router.push('/login');
    }
  }, [loggedIn, isLoading]);

  return (
    <Label className="font-bold text-base sm:text-xl md:text-2xl lg:text-3xl" onClick={() => handleClick()}>
      {isLoading ? '...' : loggedIn ? 'Вийти' : 'Увійти'}
    </Label>
  );
}
