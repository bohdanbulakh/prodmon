import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { MetricsResponse } from '@/lib/responses/metrics.response';

const MAX_POINTS = 30;

export const useMetricsData = (wsUrl: string) => {
  const [metricsHistory, setMetricsHistory] = useState<MetricsResponse[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const hostname = wsUrl.split('/').pop() ?? 'unknown';
  const localStorageKey = `metrics:${hostname}`;

  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MetricsResponse[];
        setMetricsHistory(parsed);
      } catch (error: any) {
        setError(error);
      }
    }
  }, [localStorageKey]);

  const { lastJsonMessage, readyState } = useWebSocket(wsUrl, {
    onError: () => setError(Error('Cannot connect to the server'))
  });

  useEffect(() => {
    if (error || !lastJsonMessage) return;

    const data = lastJsonMessage as MetricsResponse;
    const entry: MetricsResponse & { time: string } = {
      ...data,
      time: new Date().toISOString(),
    };

    setMetricsHistory(prev => {
      const updated = [...prev, entry].slice(-MAX_POINTS);
      localStorage.setItem(localStorageKey, JSON.stringify(updated));
      return updated;
    });
  }, [lastJsonMessage, error, localStorageKey]);

  return { metricsHistory, error, readyState };
};
