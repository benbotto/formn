import { ConnectionOptions } from './connection-options';
import { ConnectionStateType } from './connection-state-type';

/**
 * Manages database connections.
 */
export abstract class ConnectionManager<P, C> {
  /**
   * Connect to the database.
   * @param connOpts - Connection options for setting up a connection to the
   * database.
   * @return A promise that will be resolved with this underlying connection
   * pool instance.
   */
  abstract connect(connOpts: ConnectionOptions): Promise<P>;

  /**
   * End the connection pool.
   */
  abstract end(): Promise<void>;

  /**
   * Get the connection state.
   */
  abstract getConnectionState(): ConnectionStateType;

  /**
   * Get the underlying connection object.  Its type is database flavor
   * specific.
   */
  abstract getPool(): P;

  /**
   * Get a single connection from the pool.
   */
  abstract getConnection(): Promise<C>;

  /**
   * Release the connection.
   */
  abstract release(conn: C): void;
}

