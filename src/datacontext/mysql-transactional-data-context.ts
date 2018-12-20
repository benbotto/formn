import { PoolConnection, Pool } from 'mysql2/promise';

import { assert } from '../error/';

import { MySQLTransactionManager } from '../transaction/';

import { MySQLExecuter } from '../query/';

import { MySQLDataContext } from './';

/**
 * A specialized [[MySQLDataContext]] implementation for transactions.
 */
export class MySQLTransactionalDataContext extends MySQLDataContext {
  /**
   * Initialize the [[MySQLDataContext]] instance with a
   * [[MySQLTransactionManager]].
   * @param transMgr - A [[MySQLTransactionManager]] instance used to begin,
   * commit, and rollback transactions.
   */
  constructor(
    private transMgr: MySQLTransactionManager) {

    super();
  }

  /**
   * Get a [[MySQLExecuter]] instance that can be used to execute queries.
   */
  getExecuter(): MySQLExecuter {
    assert(this.transMgr.getTransactionState() === 'STARTED',
      'MySQLTransactionalDataContext.getExecuter() called before beginning transaction.');

    return this.executer;
  }

  /**
   * Not implemented.  The connection is assumed to be in a connected state.
   */
  connect(): Promise<this> {
    return Promise.reject(new Error('connect() not implemented on MySQLTransactionalDataContext.'));
  }

  /**
   * Not implemented.  The connection is assumed to be in a connected state.
   */
  end(): Promise<void> {
    return Promise.reject(new Error('end() not implemented on MySQLTransactionalDataContext.'));
  }

  /**
   * Resolve with this [[MySQLTransactionalDataContext]] instance, beginning
   * the transaction if it's not in the "STARTED" state.  For transaction
   * states other than "READY" and "STARTED" the returned promise shall be
   * rejected with an error.  [[MySQLTransactionManager]] for more details
   * about transaction support.
   * @param transFunc - See [[MySQLDataContext.beginTransaction]].
   */
  beginTransaction(transFunc: (dc: MySQLTransactionalDataContext) => Promise<any>): Promise<void> {
    let err: Error;
    let beginProm: Promise<any>;
    const transState = this.transMgr.getTransactionState();

    if (transState === 'READY') {
      beginProm = this.transMgr
        .begin()
        // Initialize the query executer using the transaction's single connection.
        .then(() => this.executer = new MySQLExecuter(this.transMgr.getConnection()));
    }
    else if (transState === 'STARTED') {
      beginProm = Promise.resolve();
    }
    else {
      return Promise
        .reject(
          new Error(`MySQLTransactionalDataContext.beginTransaction() called while transaction state is "${transState}."`));
    }

    // Once the transaction is started, call the user-supplied method with this
    // DataContext instance.
    return beginProm
      .then(() => transFunc(this))
      .then(() => {
        // If the user-supplied function resolves and the user did not manually
        // roll back the transaction then commit.
        if (this.transMgr.getTransactionState() !== 'ROLLED_BACK')
          return this.transMgr.commit();
      })
      .catch(e => {
        // Rollback the transaction on error.
        err = e;

        // The transaction may already be rolled back due to a sub-transaction.
        if (this.transMgr.getTransactionState() !== 'ROLLED_BACK')
          return this.transMgr.rollback();

        return Promise.reject(e);
      })
      .then(() => err ? Promise.reject(err) : Promise.resolve());
  }

  /**
   * Rollback the transaction.  See [[MySQLTransactionManager.rollback]].
   */
  rollbackTransaction(): Promise<void> {
    return this.transMgr
      .rollback()
      .then(() => Promise.resolve());
  }
}

