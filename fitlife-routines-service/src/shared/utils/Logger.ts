export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(data && { data })
    };
    
    console.log(JSON.stringify(logMessage));
  }

  error(message: string, error?: Error | any): void {
    this.log(LogLevel.ERROR, message, error?.stack || error);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    if (process.env.LOG_LEVEL === 'debug') {
      this.log(LogLevel.DEBUG, message, data);
    }
  }
}