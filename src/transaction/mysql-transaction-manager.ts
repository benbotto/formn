import { PoolConnection, Pool } from 'mysql2/promise';

import { assert } from '../error/';

import { MySQLConnectionManager } from '../connection/';

import { TransactionStateType, TransactionManager } from './';

/**
 * A [[TransactionManager]] implementation for MySQL.
 */
export class MySQLTransactionManager extends TransactionManager<PoolConnection, Pool> {
  // State of the transaction.
  private transState: TransactionStateType = 'READY';

  // Underlying connection for executing queries.
  private conn: PoolConnection;

  /**
   * Initialize the TransactionManager with a [[MySQLConnectionManager]] instance.
   */
  constructor(protected connMan: MySQLConnectionManager) {
    super(connMan);
  }

  /**
   * Get the state of the transaction.
   */
  getTransactionState(): TransactionStateType {
    return this.transState;
  }

  /**
   * Get the underlying PoolConnection object (MySQL specific).
   */
  getConnection(): PoolConnection {
    const state = this.getTransactionState();

    assert(this.conn,
      `TransactionManager.getConnection attempt while transaction state is "${this.getTransactionState()}."`);

    return this.conn;
  }

  /**
   * Begin a transaction.
   */
  begin(): Promise<this> {
    const state = this.getTransactionState();

    if (state === 'READY') {
      this.transState = 'STARTING';

      // Get a connection from the pool and store it locally, then start the
      // transaction.
      return this.connMan
        .getConnection()
        .then(conn => {
          this.conn = conn;

          return this.conn.query('START TRANSACTION');
        })
        .then(() => {
          this.transState = 'STARTED';
          return this;
        });
    }
    else if (state === 'STARTED') {
      // Transaction already stated.  A data-access object used within a
      // transaction may attempt to start a transaction and, in that case, this
      // TransactionManager is returned.
      return Promise.resolve(this);
    }
    else {
      // Transaction committed or rolled back already.
      return Promise.reject(
        new Error(`TransactionManager.begin attempt while transaction state is "${this.getTransactionState()}."`));
    }
  }

  /**
   * Commit a transaction.
   */
  commit(): Promise<this> {
    const state = this.getTransactionState();

    assert (state === 'STARTED',
      `TransactionManager.commit attempt while transaction state is "${state}."`);

    this.transState = 'COMMITTING';

    return this
      .getConnection()
      .query('COMMIT')
      .then(() => {
        // Release the connection back to the pool.
        this.connMan.release(this.conn);
        this.conn = null;
        this.transState = 'COMMITTED';

        return this;
      });
  }

  /**
   * Rollback a transaction.
   */
  rollback(): Promise<this> {
    const state = this.getTransactionState();

    assert (state === 'STARTED',
      `TransactionManager.rollback attempt while transaction state is "${state}."`);

    this.transState = 'ROLLING_BACK';

    return this
      .getConnection()
      .query('ROLLBACK')
      .then(() => {
        // Release the connection back to the pool.
        this.connMan.release(this.conn);
        this.conn = null;
        this.transState = 'ROLLED_BACK';

        return this;
      });
  }
}

