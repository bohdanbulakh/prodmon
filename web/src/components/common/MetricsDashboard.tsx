'use client';

import { Metrics } from '@/lib/responses/metrics.response';
import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';

type ChartProps = {
  data: Metrics[];
  dataKey: keyof Metrics;
  color: string;
  label: string;
  max?: number;
  tooltip: {
    key: keyof Metrics;
    title: string;
  }[];
}

export default function Chart (
  { data, dataKey, color, label, max, tooltip }: ChartProps,
) {

  const CustomTooltip = useCallback(({ active, payload }: TooltipProps<string, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm text-sm">
          {
            tooltip.map(({ key, title }) => (
              <div key={key}><strong>{title}:</strong> {
                Math.round(payload[0].payload[key] * 100) / 100
              }</div>
            ))
          }
        </div>
      );
    }
    return null;
  }, [tooltip]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <XAxis dataKey="time" tick={false}/>
            <YAxis domain={[0, max ?? ((dataMax: number) => dataMax)]}/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip content={CustomTooltip && <CustomTooltip/>}/>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.2}
              isAnimationActive
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
