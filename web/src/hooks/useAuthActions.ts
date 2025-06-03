import { useQueryClient } from '@tanstack/react-query';
import AuthAPI from '@/lib/api/AuthAPI';
import { AuthDto } from '@/lib/dtos/auth.dto';

export const useAuthActions = () => {
  const queryClient = useQueryClient();

  const login = async (data: AuthDto) => {
    await AuthAPI.login(data);
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    return {};
  };

  const logout = async () => {
    await AuthAPI.logout();
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    return {};
  };

  return { login, logout };
};
