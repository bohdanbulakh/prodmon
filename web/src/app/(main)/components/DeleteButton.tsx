'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import AgentAPI from '@/lib/api/AgentAPI';
import { toast } from 'sonner';

type Props = {
  hostname: string;
}

export default function DeleteButton ({ hostname }: Props) {
  const queryClient = useQueryClient();

  const handleDelete = useCallback(async () => {
    try {
      await AgentAPI.removeByHostname({ hostname });
      await queryClient.invalidateQueries({
        queryKey: ['agents'],
      });
      toast.success('Агент успішно видалений');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [hostname]);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="h-[100%]">
          <Trash2/>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Видалити хост?</AlertDialogTitle>
          <AlertDialogDescription>
            Ви зможете знову створити його через запуск агента на відповідному пристрої
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="justify-center">
          <AlertDialogCancel
            className="mr-auto min-w-fit w-full sm:w-[50%] md:w-[50%] lg:w-[50%]">Відміна</AlertDialogCancel>
          <AlertDialogAction className="min-w-fit w-full sm:w-[50%] md:w-[50%] lg:w-[50%]"
                             onClick={handleDelete}>Видалити</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
