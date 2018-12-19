import { ParameterType, InsertResultType, SelectResultType, MutateResultType } from '../';

/**
 * An Executer executes database queries.
 */
export interface Executer {
  /**
   * Execute a select query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return A promise that is resolved with an array of query rows.  Each row
   * should have key-value pairs, where the keys are the selected columns.
   */
  select(query: string, params: ParameterType): Promise<SelectResultType>;

  /**
   * Execute an insert query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return A promise that will be resolved with an object describing the
   * result of the insert.  An insertId should be present on the object if
   * available (e.g. if the insert inolved a generated column).
   */
  insert(query: string, params: ParameterType): Promise<InsertResultType>;

  /**
   * Execute an update query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return An object that has an affectedRows property indicating the number
   * of rows affected (changed) by the query.
   */
  update(query: string, params: ParameterType): Promise<MutateResultType>;

  /**
   * Execute a delete query.
   * @param query - The SQL to execute.
   * @param params - An object containing query parameters for the query.  Each
   * parameter will be preceded with a colon in query.
   * @return An object that has an affectedRows property indicating the number
   * of rows affected (changed) by the query.
   */
  delete(query: string, params: ParameterType): Promise<MutateResultType>;
}

