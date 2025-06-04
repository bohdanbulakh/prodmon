import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCallback } from 'react';
import AgentAPI from '@/lib/api/AgentAPI';
import { toast } from 'sonner';

type Props = {
  pid: number;
  hostname?: string;
}

export default function TerminateDialog ({ pid, hostname }: Props) {
  const handleTerminate = useCallback(async () => {
    if (!hostname) return;

    try {
      await AgentAPI.sendSignal({
        pid,
        hostname,
        signal: 'KILL',
      });
      toast.success('Час оновлення метрик успішно змінено');
    } catch (error) {
      toast.error(`Щось пішло не так: ${error}`);
    }
  }, [hostname, pid])

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>Зупинити</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Зупинити процес</DialogTitle>
            <DialogDescription>
              Виберіть метод зупинки процесу
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Тип зупинки</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte"/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Відміна</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleTerminate}>Зупинити</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
