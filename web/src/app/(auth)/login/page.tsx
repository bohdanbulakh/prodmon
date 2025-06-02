'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import AuthApi from '@/lib/api/AuthAPI';
import Link from 'next/link';
import AuthForm from '@/app/(auth)/components/AuthForm';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  username: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(/[a-zA-Z0-9]/, { message: 'Password must be alphanumeric' }),
});

export default function LoginForm () {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await AuthApi.login(data);
    },
    onSuccess: () => {
      toast.success('Вхід виконано успішно');
      queryClient.invalidateQueries({ queryKey: ['login'] });
      router.push('/');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Не вдалося увійти. Спробуйте пізніше';
      toast.error(message);
    },
  });

  return (
    <AuthForm
      title="Вхід"
      description="Введіть свій email та пароль, щоб увійти"
      mutation={mutation}
      button="Увійти"
      OtherAuth={
        <div className="mt-8 text-center text-base">
          Ще не зареєстровані?
          <Link href="/register" className="underline">
            Реєстрація
          </Link>
        </div>
      }
    />
  );
}
