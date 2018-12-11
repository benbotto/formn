/**
 * Normalized connection options.  Used in the [[DataContext]] class for
 * connecting to the database.
 */
export class ConnectionOptions {
  /**
   * Database host (name or IP).
   */
  host: string;

  /**
   * Database port.
   */
  port?: number;

  /**
   * Database user.
   */
  user: string;

  /**
   * Database password.
   */
  password: string;

  /**
   * The database to use.
   */
  database: string;

  /**
   * Maximum number of connections to obtain.
   */
  poolSize: number;
}

