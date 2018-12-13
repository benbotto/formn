import { createPool, Pool } from 'mysql2/promise';

import { assert } from '../error/assert';

import { ConnectionManager} from './connection-manager';
import { ConnectionOptions } from './connection-options';
import { ConnectionStateType } from './connection-state-type';

/**
 * A [[ConnectionManager]] class specialized for MySQL.
 */
export class MySQLConnectionManager extends ConnectionManager<Pool> {
  private getConn: Promise<Pool>;
  private conn: Pool;
  private state: ConnectionStateType = 'DISCONNECTED';

  // This is a PoolOptions object, but PoolOptions is missing some properties
  // in @types/mysql2 (namely namedPlaceholders).
  // https://github.com/types/mysql2/issues/25
  private connOpts: object;

  /**
   * Connect to the database.
   * @param connOpts - Connection options for setting up a connection to the
   * database.
   * @return A promise that will be resolved with this underlying connection
   * instance.
   */
  connect(connOpts: ConnectionOptions): Promise<Pool> {
    if (this.getConnectionState() !== 'DISCONNECTED')
      return this.getConn;

    this.connOpts = {
      host               : connOpts.host,
      port               : connOpts.port || 3306,
      user               : connOpts.user,
      password           : connOpts.password,
      database           : connOpts.database,
      connectionLimit    : connOpts.poolSize,
      // If all connections are used, wait for one to free up.
      waitForConnections : true,
      queueLimit         : 0,
      // https://github.com/sidorares/node-mysql2/blob/master/documentation/Extras.md
      // Also see the issue above.
      namedPlaceholders  : true,
    };

    this.conn  = createPool(this.connOpts);
    this.state = 'CONNECTING';

    // Get a connection from the pool to verify that the connection options
    // work.
    return this.getConn = this.conn
      .getConnection()
      .then(conn => {
        conn.release();
        this.state = 'CONNECTED';
        return this.conn;
      });
  }

  /**
   * End the connection pool.
   */
  end(): Promise<void> {
    if (this.getConnectionState() === 'DISCONNECTED')
      return Promise.resolve();

    return this.getConn
      .then(() => this.conn.end())
      .then(() => {
        this.state = 'DISCONNECTED';
        return;
      });
  }

  /**
   * Get the connection state.
   */
  getConnectionState(): ConnectionStateType {
    return this.state;
  }

  /**
   * Get the underlying connection object.
   */
   getConnection(): Pool {
     assert(this.getConnectionState() === 'CONNECTED',
       'MySQLConnectionManager.getConnection() called but the connection is not established.  Call connect().');

     return this.conn;
   }
}

