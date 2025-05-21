export class MetricsResponse {
  [hostname: string]: Metrics;
}

export interface Metrics {
  cpu_usage_percent: number;
  memory_used_mb: number;
  memory_used_percent: number;
  processes: string[];
}
