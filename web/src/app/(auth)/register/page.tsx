'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import AuthApi from '@/lib/api/AuthAPI';
import Link from 'next/link';
import AuthForm, { formSchema } from '@/app/(auth)/components/AuthForm';
import { useRouter } from 'next/navigation';

export default function RegisterForm () {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await AuthApi.register(data);
    },
    onSuccess: () => {
      toast.success('Реєстрація пройшла успішно');
      queryClient.invalidateQueries({ queryKey: ['register'] });
      router.push('/');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
        'Не вдалося створити обліковий запис. Спробуйте пізніше';
      toast.error(message);
    },
  });

  return (
    <AuthForm
      title="Реєстрація"
      description="Введіть дані про себе, щоб зареєструватися"
      mutation={mutation}
      button="Зареєструватися"
      OtherAuth={
        <div className="mt-8 text-center text-base">
          {'Вже маєте обліковий запис?\t'}
          <Link href="/login" className="underline">
            Увійти
          </Link>
        </div>
      }
    />
  );
}
