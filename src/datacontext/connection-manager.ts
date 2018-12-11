import { ConnectionOptions } from './connection-options';
import { ConnectionStateType } from './connection-state-type';

/**
 * Manages database connections.
 */
export abstract class ConnectionManager {
  /**
   * Connect to the database.
   * @param connOpts - Connection options for setting up a connection to the
   * database.
   * @return A promise that will be resolved with this [[DataContext]] instance.
   */
  abstract connect(connOpts: ConnectionOptions): Promise<this>;

  /**
   * End the connection pool.
   */
  abstract end(): void;

  /**
   * Get the connection state.
   */
  abstract getConnectionState(): ConnectionStateType;
}

