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
   * Call transFunc with this [[MySQLTransactionalDataContext]] instance,
   * beginning the transaction if it's not in the "STARTED" state.  For
   * transaction states other than "READY" and "STARTED" the returned promise
   * shall be rejected with an error.  See [[MySQLTransactionManager]] for more
   * details about transaction support.
   * @param transFunc - See [[MySQLDataContext.beginTransaction]].
   * @typeparam R transFunc shall be resolved with type R, and this function
   * will proxy the return when transFunc completes.
   */
  async beginTransaction<R>(transFunc: (dc: MySQLTransactionalDataContext) => Promise<R>): Promise<R> {
    const transState = this.transMgr.getTransactionState();

    if (transState === 'READY') {
      await this.transMgr.begin();

      // Initialize the query executer using the transaction's single connection.
      this.executer = new MySQLExecuter(this.transMgr.getConnection());
    }
    else if (transState !== 'STARTED') {
      throw new Error(
        `MySQLTransactionalDataContext.beginTransaction() called while transaction state is "${transState}."`);
    }

    // Once the transaction is started, call the user-supplied method with this
    // DataContext instance.  This function (beginTransaction) shall be resolved
    // with the return of transFunc.
    let tfRet: R;

    try {
      tfRet = await transFunc(this);
    }
    catch (err) {
      // If an exception occurs in the user-supplied function, then rollback
      // the transaction.  Unless, that is, the transaction was already rolled
      // back manually or via a sub-transaction).
      if (this.transMgr.getTransactionState() !== 'ROLLED_BACK')
        await this.transMgr.rollback();

      throw err;
    }

    // If the user-supplied function resolves and the user did not manually
    // roll back the transaction then commit.
    if (this.transMgr.getTransactionState() !== 'ROLLED_BACK')
      await this.transMgr.commit();

    // Proxy the return of the user-supplied function.
    return tfRet;
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

