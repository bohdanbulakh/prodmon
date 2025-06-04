import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import AgentAPI from '@/lib/api/AgentAPI';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  pid: number;
  hostname?: string;
}

export default function TerminateDialog ({ pid, hostname }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<'KILL' | 'TERM' | null>(null);

  const handleTerminate = useCallback(async () => {
    if (!hostname || !selectedMethod) return;

    try {
      await AgentAPI.sendSignal({
        pid,
        hostname,
        signal: selectedMethod,
      });
      toast.success('Час оновлення метрик успішно змінено');
    } catch (error) {
      toast.error(`Щось пішло не так: ${error}`);
    }
  }, [hostname, pid, selectedMethod]);

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>Зупинити</Button>
        </DialogTrigger>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Зупинити процес</DialogTitle>
            <DialogDescription>
              Виберіть метод зупинки процесу
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={value => setSelectedMethod(value as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Метод зупинки"/>
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="KILL">KILL</SelectItem>
              <SelectItem value="TERM">TERM</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter className="justify-center">
            <DialogClose asChild className="mr-auto">
              <Button variant="outline" className="min-w-fit w-full sm:w-[50%] md:w-[50%] lg:w-[50%]">Відміна</Button>
            </DialogClose>
            <Button variant="destructive" className="min-w-fit w-full sm:w-[50%] md:w-[50%] lg:w-[50%]" onClick={handleTerminate}>Зупинити</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
