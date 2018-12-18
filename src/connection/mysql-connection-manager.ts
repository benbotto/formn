import { createPool, Pool, PoolConnection } from 'mysql2/promise';

import { assert } from '../error/assert';

import { ConnectionManager} from './connection-manager';
import { ConnectionOptions } from './connection-options';
import { ConnectionStateType } from './connection-state-type';

/**
 * A [[ConnectionManager]] class specialized for MySQL.
 */
export class MySQLConnectionManager extends ConnectionManager<Pool> {
  private getConn: Promise<Pool>;
  private pool: Pool;
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

    this.pool  = createPool(this.connOpts);
    this.state = 'CONNECTING';

    // Get a connection from the pool to verify that the connection options
    // work.
    return this.getConn = this.pool
      .getConnection()
      .then(conn => {
        conn.release();
        this.state = 'CONNECTED';
        return this.pool;
      })
      .catch(err => {
        this.state = 'DISCONNECTED';
        return Promise.reject(err);
      });
  }

  /**
   * End the connection pool.
   */
  end(): Promise<void> {
    if (this.getConnectionState() === 'DISCONNECTED')
      return Promise.resolve();

    return this.getConn
      .then(() => this.pool.end())
      .then(() => {
        this.state = 'DISCONNECTED';
        return;
      })
      .catch(err => {
        this.state = 'DISCONNECTED';
        return Promise.reject(err);
      });
  }

  /**
   * Get the connection state.
   */
  getConnectionState(): ConnectionStateType {
    return this.state;
  }

  /**
   * Get the underlying connection pool object.
   */
  getPool(): Pool {
    assert(this.getConnectionState() === 'CONNECTED',
      'MySQLConnectionManager.getPool() called but the connection is not established.  Call connect().');

    return this.pool;
  }

  /**
   * Get a single connection from the pool.  (MySQL specific.)
   * @returns A PoolConnection instance, which is a single connection from the
   * pool.  It is the users responsibility to release() this connection using
   * [[MySQLConnectionManager.release]] method.
   */
  getConnection(): Promise<PoolConnection> {
    assert(this.getConnectionState() === 'CONNECTED',
      'MySQLConnectionManager.getConnection() called but the connection is not established.  Call connect().');

    return this.pool.getConnection();
  }

  /**
   * Release the connection.
   */
  release(conn: PoolConnection): void {
    conn.release();
  }
}

