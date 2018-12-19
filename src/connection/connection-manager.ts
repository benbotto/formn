import { ConnectionOptions, ConnectionStateType } from './';

/**
 * Manages database connections.
 * @typeparam P The type of the underlying connection pool, returned from the
 * [[ConnectionManager.getPool]] method.
 */
export abstract class ConnectionManager<P> {
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
}

