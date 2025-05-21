'use client';

import { useMetricsData } from '@/hooks/useMetricsData';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from '@/components/common/MetricsDashboard';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = {
  cpu: '#8884d8',
  memMb: '#82ca9d',
  memPercent: '#ff7300',
};

type MetricsPageProps = {
  hostname: string;
};

export function MetricsPage ({ hostname }: MetricsPageProps) {
  const { metricsHistory: history, error } = useMetricsData(
    `ws://${process.env.NEXT_PUBLIC_API_HOST}/metrics/${hostname}`
  );

  if (!history || error) {
    if (error) toast.error(error.message);
    redirect('/');
  }

  const metrics = history[history.length - 1];
  const maxMemoryMb = metrics?.memory_max;

  return (
    <Card key={hostname}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          {hostname}
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
              { key: 'memory_used_percent', title: 'Memory Usage (%)' }
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
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Process Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.processes?.length > 0 ? (
                  metrics.processes.map((proc: string, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{proc}</TableCell>
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
