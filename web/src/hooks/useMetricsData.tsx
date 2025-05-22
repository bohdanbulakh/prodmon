import { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { Metrics } from '@/lib/responses/metrics.response';

const MAX_POINTS = 30;
const MAX_RECONNECT_ATTEMPTS = 3;

export const useMetricsData = (wsUrl: string) => {
  const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const reconnectCount = useRef(0);

  const { lastJsonMessage, readyState } = useWebSocket(wsUrl, {
    shouldReconnect: () => {
      if (reconnectCount.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectCount.current += 1;
        return true;
      } else {
        setError(new Error('Host disconnected'));
        reconnectCount.current = 0;
        return false;
      }
    },
    onReconnectStop: () => setError(Error('Host disconnected')),
  });


  useEffect(() => {
    if (error || !lastJsonMessage) return;

    setMetricsHistory(prev => {
      const { processes, ...data } = lastJsonMessage as Omit<Metrics, 'time'>;
      const entry: Metrics = {
        ...data,
        time: new Date().toISOString(),
        processes: processes.sort(),
      };

      return [...prev, entry].slice(-MAX_POINTS);
    });
  }, [lastJsonMessage, error]);

  return { metricsHistory, error, readyState };
};
