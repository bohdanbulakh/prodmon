'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import {
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  ReactElement,
} from 'react';

const formSchema = z.object({
  username: z.string(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(/[a-zA-Z0-9]/, { message: 'Password must be alphanumeric' }),
});

type FormProps = {
  title: string;
  description: string;
  mutation: UseMutationResult<any, any, any, any>;
  OtherAuth: ReactElement<any, any>;
  button: string;
};

export default function AuthForm ({
  title,
  description,
  mutation,
  OtherAuth,
  button,
}: FormProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit (values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Card className="mx-auto min-w-fit max-w-1/3 w-full max-h-full">
      <CardHeader>
        <CardTitle className="text-4xl">{title}</CardTitle>
        <CardDescription className="text-xl">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="grid gap-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="username" className="text-lg">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input id="username" placeholder="exmpleuser1" autoComplete="username" {...field}></Input>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>)}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="password" className="text-lg">
                      Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput id="password" placeholder="********" autoComplete="current-password" {...field}></PasswordInput>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>)}
              />
              <Button
                type="submit"
                className="w-full text-lg"
                size="lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Обробка...' : button}
              </Button>
            </div>
          </form>
        </Form>
        {OtherAuth}
      </CardContent>
    </Card>
  );
}
