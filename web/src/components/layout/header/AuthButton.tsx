'use client';

import { NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useRouter } from 'next/navigation'
import { useAuthActions } from '@/hooks/useAuthActions';

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
      await refetch();
    } else {
      router.push('/login');
    }
  }, [loggedIn, isLoading]);

  return <NavigationMenuItem>
    <NavigationMenuLink
      className={navigationMenuTriggerStyle()}
    >
      <Button variant="link" onClick={() => handleClick()}>
        {isLoading ? '...' : loggedIn ? 'Вийти' : 'Увійти'}
      </Button>
    </NavigationMenuLink>
  </NavigationMenuItem>;
}
