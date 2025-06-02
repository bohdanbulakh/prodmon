'use client';

import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/queryClient';
import AuthenticationProvider from '@/lib/providers/authentication/AuthenticationProvider';

export function Providers ({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticationProvider>
        {children}
      </AuthenticationProvider>
    </QueryClientProvider>
  );
}
