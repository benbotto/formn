import { ConnectionManager } from '../connection/';

import { TransactionStateType } from './';

/**
 * Class for managing database transactions.
 * @typeparam C The type of connection returned from
 * [[TransactionManager.getConnection]].
 * @typeparam P The type of connection pool used by the database-specific
 * [[ConnectionManager]].
 */
export abstract class TransactionManager<C, P> {
  /**
   * Initialize the TransactionManager with a [[ConnectionManager]] instance.
   */
  constructor(protected connMan: ConnectionManager<P>) {
  }

  /**
   * Get the state of the transaction.
   */
  abstract getTransactionState(): TransactionStateType;

  /**
   * Get the underlying connection object, which should be a single connection
   * from the connection pool upon which queries can be executed.
   */
  abstract getConnection(): C;

  /**
   * Begin a transaction.
   */
  abstract begin(): Promise<this>;

  /**
   * Commit a transaction.
   */
  abstract commit(): Promise<this>;

  /**
   * Rollback a transaction.
   */
  abstract rollback(): Promise<this>;
}

