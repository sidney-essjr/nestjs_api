export interface ILogger {
  log(message: string, meta?: object): void;
  error(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  debug?(message: string, meta?: object): void;
}
