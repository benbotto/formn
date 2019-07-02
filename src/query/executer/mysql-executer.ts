import { Connection, Pool, PoolConnection } from 'mysql2/promise';

import { Executer, SelectResultType, ParameterType, InsertResultType, MutateResultType } from '../';

/**
 * An Executer for executing MySQL queries.
 */
export class MySQLExecuter implements Executer {
  /**
   * Initialize the Executer instance.
   * @param pool - A MySQL connection instance (pool or single connection)
   */
  constructor(
    public pool: Connection | Pool | PoolConnection) {
  }

  /**
   * Execute a select query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return A promise that is resolved with an array of query rows.  Each row
   * should have key-value pairs, where the keys are the selected columns.
   */
  select(query: string, params: ParameterType): Promise<SelectResultType> {
    return this.pool
      .query(query, params)
      .then(([results]) => results as SelectResultType);
  }

  /**
   * Execute an insert query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return A promise that will be resolved with an object describing the
   * result of the insert.  An insertId should be present on the object if
   * available (e.g. if the insert inolved a generated column).
   */
  insert(query: string, params: ParameterType): Promise<InsertResultType> {
    return this.pool
      .query(query, params)
      .then(([result]) => result as InsertResultType);
  }

  /**
   * Execute an update query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return An object that has an affectedRows property indicating the number
   * of rows affected (changed) by the query.
   */
  update(query: string, params: ParameterType): Promise<MutateResultType> {
    return this.pool
      .query(query, params)
      .then(([result]) => result as MutateResultType);
  }

  /**
   * Execute a delete query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return An object that has an affectedRows property indicating the number
   * of rows affected (changed) by the query.
   */
  delete(query: string, params: ParameterType): Promise<MutateResultType> {
    return this.pool
      .query(query, params)
      .then(([result]) => result as MutateResultType);
  }

  /**
   * Execute a raw query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return A promise that shall be resolved if the query succeeds, or
   * rejected otherwise.
   */
  query(query: string, params: ParameterType): Promise<any> {
    return this.pool
      .query(query, params);
  }
}

