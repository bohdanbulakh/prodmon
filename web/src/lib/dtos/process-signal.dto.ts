export class ProcessSignalDto {
  hostname: string;
  pid: number;
  signal: ProcessSignalType;
}

export type ProcessSignalType = 'KILL' | 'TERM';
