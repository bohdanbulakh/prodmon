export class MetricsResponse {
  hostname: string;
  cpu_usage_percent: number;
  memory_used_mb: number;
  memory_used_percent: number;
  memory_max: number;
  processes: string[];
}
