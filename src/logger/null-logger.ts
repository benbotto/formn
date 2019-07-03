import { Logger } from './';

/**
 * Do-nothing logger.
 */
export class NullLogger implements Logger {
  /**
   * Log a message.
   * @param message - What to log.
   */
  log(...messages: string[]): void {
  }

  /**
   * Log an error.
   * @param messages - What to log.
   */
  error(...messages: string[]): void {
  }

  /**
   * Log a warning.
   * @param messages - What to log.
   */
  warn(...messages: string[]): void {
  }
}

