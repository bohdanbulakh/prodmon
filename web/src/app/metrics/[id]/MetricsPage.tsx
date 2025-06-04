'use client';

import { useMetricsData } from '@/hooks/useMetricsData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from '@/components/common/MetricsDashboard';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { ProcessesList } from '@/lib/responses/metrics.response';
import { useAuthentication } from '@/hooks/useAuthentication';
import { round } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AgentAPI from '@/lib/api/AgentAPI';
import { Label } from '@/components/ui/label';

const COLORS = {
  cpu: '#8884d8',
  memMb: '#82ca9d',
  memPercent: '#ff7300',
};

type MetricsPageProps = {
  agentId: string;
  apiUrl: string;
};

export function MetricsPage ({ agentId, apiUrl }: MetricsPageProps) {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${protocol}://${apiUrl}/metrics/${agentId}`;

  const { metricsHistory: history, error } = useMetricsData(url);
  const { loggedIn, isLoading } = useAuthentication();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !loggedIn) router.push('/');
    if (error) {
      toast.error(error.message);
      router.push('/');
    }
  }, [error, loggedIn, isLoading]);

  const metrics = history[history.length - 1];
  const maxMemoryMb = metrics?.memory_max;

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen && timeRef.current) {
      try {
        await AgentAPI.setTime({
          hostname: metrics.hostname,
          update_time: +timeRef.current.value,
        });
        toast.success("Час оновлення метрик успішно змінено")
      } catch (error) {
        toast.error(`Щось пішло не так: ${error}`);
      }
    }
  };

  return (
    <Card key={agentId}>
      <CardHeader className="flex">
        <CardTitle className="text-xl font-bold flex items-center justify-between mr-auto">
          {metrics?.hostname}
        </CardTitle>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline">Час оновлення</Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <Label className=" text-sm">
                Встановіть час оновлення метрик для агента
              </Label>
              <Input
                id="width"
                type="number"
                min={1}
                defaultValue="5"
                className="col-span-2 h-8"
                ref={timeRef}
              />
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-rows-2 gap-4">
          <Chart
            color={COLORS.cpu}
            data={history}
            dataKey="cpu_usage_percent"
            label="CPU Usage (%)"
            max={100}
            tooltip={[{ key: 'cpu_usage_percent', title: 'CPU Usage (%)' }]}
          />
          <Chart
            color={COLORS.memPercent}
            data={history}
            dataKey="memory_used_mb"
            label="Memory Usage (MB)"
            max={maxMemoryMb}
            tooltip={[
              { key: 'memory_used_mb', title: 'Memory Usage (MB)' },
              { key: 'memory_used_percent', title: 'Memory Usage (%)' },
            ]}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Processes</h3>
          <Separator className="mb-4"/>
          <ScrollArea className="h-64 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] min-w-fit">PID</TableHead>
                  <TableHead className="w-1/3 min-w-fit">Process Name</TableHead>
                  <TableHead>Memory Used, %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.processes?.length > 0 ? (
                  metrics.processes.map(({ pid, name, memory_used_percent }: ProcessesList, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{pid}</TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell>{round(memory_used_percent, 3)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-muted-foreground italic">
                      No process data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
