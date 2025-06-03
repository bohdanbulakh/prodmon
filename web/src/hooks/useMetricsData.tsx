import { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { MetricsResponse } from '@/lib/responses/metrics.response';

const MAX_POINTS = 30;
const MAX_RECONNECT_ATTEMPTS = 3;

export const useMetricsData = (wsUrl: string) => {
  const [metricsHistory, setMetricsHistory] = useState<MetricsResponse[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const reconnectCount = useRef(0);

  const hostname = wsUrl.split('/').pop() ?? 'unknown';
  const localStorageKey = `metrics:${hostname}`;

  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MetricsResponse[];
        setMetricsHistory(parsed);
      } catch {
        localStorage.removeItem(localStorageKey);
      }
    }
  }, [localStorageKey]);

  const { lastJsonMessage, readyState } = useWebSocket(wsUrl, {
    shouldReconnect: () => {
      if (reconnectCount.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectCount.current += 1;
        return true;
      }

      reconnectCount.current = 0;
      localStorage.removeItem(localStorageKey);
      setError(Error('Host disconnected'));
      return false;
    },
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
