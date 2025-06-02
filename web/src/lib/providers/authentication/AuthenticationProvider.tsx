'use client';
import { createContext, FC, PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthAPI from '@/lib/api/AuthAPI';
import { AuthenticationContextType } from '@/lib/types/authContext';


export const AuthenticationContext = createContext<AuthenticationContextType>({
  loggedIn: false,
  isLoading: true,
});

const AuthenticationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: AuthAPI.me,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <AuthenticationContext
      value={{
        loggedIn: !!data,
        isLoading: isLoading,
      }}
    >
      {children}
    </AuthenticationContext>
  );
};

export default AuthenticationProvider;
