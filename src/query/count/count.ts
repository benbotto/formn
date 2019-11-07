import { assert } from '../../error/';

import { Schema, DataMapper } from '../../datamapper/';

import { Query, Escaper, Executer, From, ExecutableQuery, SelectResultType } from '../';

/**
 * Represents a count query (SELECT COUNT(*)).
 */
export class Count extends Query {
  // Column to count.
  protected countCol: string;

  /**
   * Initialize the query using a From instance.
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]]).  Used when escaping column names in
   * compiled conditions.
   * @param executer - An [[Executer]] instance that matches the database type
   * (e.g. [[MySQLExecuter]]).
   * @param from - A [[From]] instance which holds the base table, all
   * joined-in tables, and the where clause.
   * @param isDistinct - Set to true to make the count distinct.
   */
  constructor(
    protected escaper: Escaper,
    protected executer: Executer,
    protected from: From,
    protected isDistinct: boolean = false) {

    super();
  }

  /**
   * Make the query distinct.
   */
  distinct(): this {
    this.isDistinct = true;

    return this;
  }

  /**
   * Count the number of records, optionally on a column.
   * @param col - An optional column to count on.  If not provided, then
   * COUNT(*) is used.
   */
  count(col?: string): this {
    // Count may only be performed once on a query.
    assert(this.countCol === undefined, 'count already performed on query.');

    if (col) {
      // Make sure the column is available for selection.
      assert(this.from.getFromMeta().isColumnAvailable(col),
        `"${col}" is not available for count.`);

      this.countCol = col;
    }
    else
      this.countCol = '*';

    return this;
  }

  /**
   * Get the SQL as a string.
   */
  toString(): string {
    let sql = 'SELECT  ';

    // COUNT portion of the query.
    if (this.countCol === undefined || this.countCol === '*')
      sql += `COUNT(*) AS count`
    else {
      // Map the property to a fully-qualified column name, then escape it.
      const fromMeta    = this.from.getFromMeta();
      const fromColMeta = fromMeta.getFromColumnMetaByProp(this.countCol);
      const fqColName   = this.escaper
        .escapeFullyQualifiedColumn(fromColMeta.fqColName);

      sql += 'COUNT(';

      if (this.isDistinct)
        sql += 'DISTINCT ';

      sql += `${fqColName}) AS count`;
    }

    // Add the FROM (which includes the JOINS and WHERE).
    sql += '\n';
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
      params: this.from.getFromMeta().paramList.getParams()
    };
  }

  /**
   * Execute the query and return an array of results of type T.
   * @return A promise that shall be resolved with the normalized query results
   * of type T.  If an error occurs while executing the query, the returned
   * promise shall be rejected with the unmodified error.
   */
  async execute(): Promise<number> {
    const exe = this.buildQuery();

    const res: SelectResultType = await this.executer
      .select(exe.query, exe.params);

    return res[0].count;
  }
}

