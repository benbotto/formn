/**
 * Interface for basic loggers.
 */
export interface Logger {
  /**
   * Log a message.
   * @param messages - What to log.
   */
  log(...messages: string[]): void;

  /**
   * Log an error.
   * @param messages - What to log.
   */
  error(...messages: string[]): void;

  /**
   * Log a warning.
   * @param messages - What to log.
   */
  warn(...messages: string[]): void;
}
