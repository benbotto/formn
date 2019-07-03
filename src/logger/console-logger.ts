import { Logger } from './';

/**
 * Log to the console.
 */
export class ConsoleLogger implements Logger {
  /**
   * Log a message.
   * @param message - What to log.
   */
  log(...messages: string[]): void {
    console.log(...messages);
  }

  /**
   * Log an error.
   * @param messages - What to log.
   */
  error(...messages: string[]): void {
    console.error(...messages);
  }

  /**
   * Log a warning.
   * @param messages - What to log.
   */
  warn(...messages: string[]): void {
    console.warn(...messages);
  }
}

