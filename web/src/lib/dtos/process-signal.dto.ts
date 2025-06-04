export class ProcessSignalDto {
  hostname: string;
  pid: number;
  signal: "KILL" | "TERM";
}
