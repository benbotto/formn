import { assert } from '../../error/';

import { Query, Escaper, Executer, From, FromColumnMeta, ExecutableQuery,
  MutateResultType } from '../';

/**
 * A [[Query]] class that represents a DELETE query.
 */
export class Delete extends Query {
  /**
   * Initialize the [[Query]] using a [[From]] instance.
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]]).  Used when escaping column names in
   * compiled conditions.
   * @param executer - An [[Executer]] instance that matches the database type
   * (e.g. [[MySQLExecuter]]).
   * @param from - A [[From]] instance which holds the base table, all
   * joined-in tables, and the where clause.
   * @param alias - Alias of the table to delete from.  Optional and defaults
   * to the base table.
   */
  constructor(
    protected escaper: Escaper,
    protected executer: Executer,
    protected from: From,
    protected alias?: string) {

    super();

    // Alias defaults to the base table.
    if (!this.alias)
      this.alias = this.from.getBaseTableMeta().alias;
  }

  /**
   * Get the SQL that represents the query.
   * @return The SQL representing the update statement.
   */
  toString(): string {
    let sql = `DELETE  ${this.escaper.escapeProperty(this.alias)}\n`;

    sql += this.from.toString();

    return sql;
  }

  /**
   * Build the query.
   * @return The string-representation of the query to execute along with query
   * parameters.
   */
  buildQuery(): ExecutableQuery {
    return {
      query: this.toString(),
      params: this.from.getParameterList().getParams()
    };
  }

  /**
   * Execute the query.
   * @return A promise that shall be resolved with an object containing an
   * "affectedRows" property.  If an error occurs when executing the query, the
   * returned promise shall be rejected with the error (unmodified).
   */
  execute(): Promise<MutateResultType> {
    const exe = this.buildQuery();

    return this.executer
      .delete(exe.query, exe.params);
  }
}

