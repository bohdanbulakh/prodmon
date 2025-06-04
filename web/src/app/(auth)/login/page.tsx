'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import AuthForm, { formSchema } from '@/app/(auth)/components/AuthForm';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/hooks/useAuthActions';

export default function LoginForm () {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { login } = useAuthActions();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await login(data);
    },
    onSuccess: () => {
      toast.success('Вхід виконано успішно');
      queryClient.invalidateQueries({ queryKey: ['login'] });
      router.push('/');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
        'Не вдалося увійти. Спробуйте пізніше';
      toast.error(message);
    },
  });

  return (
    <AuthForm
      title="Вхід"
      description="Введіть свій username та пароль, щоб увійти"
      mutation={mutation}
      button="Увійти"
      OtherAuth={
        <div className="mt-8 text-center text-base">
          {'Ще не зареєстровані?\t'}
          <Link href="/register" className="underline">
            Реєстрація
          </Link>
        </div>
      }
    />
  );
}
