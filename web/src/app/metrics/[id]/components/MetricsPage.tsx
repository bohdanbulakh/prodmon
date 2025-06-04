'use client';

import { useMetricsData } from '@/hooks/useMetricsData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from '@/app/metrics/[id]/components/MetricsDashboard';
import { useCallback, useEffect, useState } from 'react';
import { ProcessesList } from '@/lib/responses/metrics.response';
import { useAuthentication } from '@/hooks/useAuthentication';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AgentAPI from '@/lib/api/AgentAPI';
import { Label } from '@/components/ui/label';
import DataTable from '@/app/metrics/[id]/components/DataTable';
import { useQuery } from '@tanstack/react-query';

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
  const [updateTime, setUpdateTime] = useState<number>();
  const [initialUpdateTime, setInitialUpdateTime] = useState<number>();

  const { data } = useQuery({
    queryFn: () => AgentAPI.getById(agentId),
    queryKey: ['getById', agentId],
  });

  useEffect(() => {
    if (!isLoading && !loggedIn) router.push('/');
    if (error) {
      toast.error(error.message);
      router.push('/');
    }

    if (!data) return;

    const time = data.update_time;
    setUpdateTime(time);
    setInitialUpdateTime(time);
  }, [error, loggedIn, isLoading, data]);


  const metrics = history[history.length - 1];
  const maxMemoryMb = metrics?.memory_max;

  const handleOpenChange = useCallback(async (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen && metrics && updateTime && initialUpdateTime && +updateTime !== initialUpdateTime) {
      try {
        await AgentAPI.setTime({
          hostname: metrics.hostname,
          update_time: +updateTime,
        });
        toast.success('Час оновлення метрик успішно змінено');
        setInitialUpdateTime(+updateTime);
      } catch (error) {
        toast.error(`Щось пішло не так: ${error}`);
      }
    }
  }, [metrics, updateTime, initialUpdateTime]);

  return (
    <Card className="w-full md:w-4/5 lg:w-2/3 mx-auto">
      <CardHeader className="flex">
        <CardTitle
          className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold flex items-center justify-between mr-auto">
          {metrics?.hostname}
        </CardTitle>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="text-xs sm:text-sm md:text-base lg:text-xl">Час оновлення</Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <Label className=" text-sm">
                Встановіть час оновлення метрик для агента
              </Label>
              <Input
                id="update-time"
                type="number"
                min={1}
                className="col-span-2 h-8"
                value={updateTime}
                onChange={(e) => setUpdateTime(e.target.value ? +e.target.value : 5)}
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
            label="Використання CPU (%)"
            max={100}
            tooltip={[{ key: 'cpu_usage_percent', title: 'Використання CPU (%)' }]}
          />
          <Chart
            color={COLORS.memPercent}
            data={history}
            dataKey="memory_used_mb"
            label="Використання ОП (MB)"
            max={maxMemoryMb}
            tooltip={[
              { key: 'memory_used_mb', title: 'Використання ОП (MB)' },
              { key: 'memory_used_percent', title: 'Використання ОП (%)' },
            ]}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Процеси</h3>
          <DataTable hostname={metrics?.hostname}
                     data={metrics?.processes?.map(({ memory_used_mb, ...data }: ProcessesList) => data) ?? []}/>
        </div>
      </CardContent>
    </Card>
  );
}
