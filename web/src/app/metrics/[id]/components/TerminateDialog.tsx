'use client';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PropsWithChildren, useCallback, useRef } from 'react';
import AgentAPI from '@/lib/api/AgentAPI';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProcessSignalType } from '@/lib/dtos/process-signal.dto';

type Props = {
  pid: number;
  hostname?: string;
} & PropsWithChildren;

export default function TerminateDialog ({ pid, hostname, children }: Props) {
  const selectedMethod = useRef<ProcessSignalType>('TERM');

  const handleTerminate = useCallback(async () => {
    if (!hostname) return;
    try {
      await AgentAPI.sendSignal({
        pid,
        hostname,
        signal: selectedMethod.current,
      });
      toast.success('Процес успішно зупинено');
    } catch (error) {
      toast.error(`Щось пішло не так: ${error}`);
    }
  }, [hostname, pid, selectedMethod.current]);

  return (
    <AlertDialog>
      <form>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent className="">
          <AlertDialogHeader>
            <AlertDialogTitle>Зупинити процес</AlertDialogTitle>
            <AlertDialogDescription>
              Виберіть метод зупинки процесу
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select defaultValue="TERM" onValueChange={value => {
            selectedMethod.current = value as any;
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Метод зупинки"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TERM">TERM</SelectItem>
              <SelectItem value="KILL">KILL</SelectItem>
            </SelectContent>
          </Select>
          <AlertDialogFooter className="justify-center">
            <AlertDialogCancel
              className="mr-auto min-w-fit w-full sm:w-[50%] md:w-[50%] lg:w-[50%]">Відміна</AlertDialogCancel>
            <AlertDialogAction className="min-w-fit w-full sm:w-[50%] md:w-[50%] lg:w-[50%]"
                               onClick={handleTerminate}>Зупинити</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  );
}
