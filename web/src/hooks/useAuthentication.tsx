import AuthAPI from '@/lib/api/AuthAPI';
import { useQuery } from '@tanstack/react-query';


export const useAuthentication = () => {
  const { isLoading, isSuccess, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: AuthAPI.me,
    retry: false,
  });

  return {
    loggedIn: isSuccess,
    isLoading,
    refetch,
  };
};
