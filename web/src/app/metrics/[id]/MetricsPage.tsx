'use client';

import { useMetricsData } from '@/hooks/useMetricsData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from '@/components/common/MetricsDashboard';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';
import { ProcessesList } from '@/lib/responses/metrics.response';
import { useAuthentication } from '@/hooks/useAuthentication';

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
  const { loggedIn, isLoading } = useAuthentication()
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !loggedIn) router.push('/');
    if (error) {
      toast.error(error.message);
      router.push('/');
    }
  }, [error, loggedIn, isLoading]);

  const metrics = history[history.length - 1];
  const maxMemoryMb = metrics?.memory_max;

  return (
    <Card key={agentId}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          {metrics?.hostname}
        </CardTitle>
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
                  <TableHead className="w-[50px]">PID</TableHead>
                  <TableHead>Process Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.processes?.length > 0 ? (
                  metrics.processes.map(({ pid, name }: ProcessesList, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{pid}</TableCell>
                      <TableCell>{name}</TableCell>
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
