import { assert } from '../../error/';

import { Schema, DataMapper } from '../../datamapper/';

import { Query, Escaper, Executer, From, OrderByType, OrderBy,
  ExecutableQuery, SelectResultType } from '../';

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
   * @param order - An [[OrderBy]] instance which is optionally used to order
   * the query results.
   */
  constructor(
    protected escaper: Escaper,
    protected executer: Executer,
    protected from: From,
    protected order: OrderBy) {

    super();
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
   * Order by one or more columns.
   * @param orders - A list of fully-qualified properties in the form
   * &lt;table-alias&gt;.&lt;property&gt;, or an array of [[OrderByType]] with
   * the fully-qualified property and direction.
   */
  orderBy(...orders: OrderByType[] | string[]): this {
    this.order.orderBy(...orders);

    return this;
  }

  /**
   * Get the SQL as a string.
   */
  toString(): string {
    let sql = 'SELECT  ';

    // COUNT portion of the query.
    if (this.countCol === undefined || this.countCol === '*')
      sql += 'COUNT(*) AS count'
    else {
      // Map the property to a fully-qualified column name, then escape it.
      const fromMeta    = this.from.getFromMeta();
      const fromColMeta = fromMeta.getFromColumnMetaByProp(this.countCol);
      const fqColName   = this.escaper
        .escapeFullyQualifiedColumn(fromColMeta.fqColName);

      sql += `COUNT(${fqColName}) AS count`;
    }

    // Add the FROM (which includes the JOINS and WHERE).
    sql += '\n';
    sql += this.from.toString();

    // Add the order if there is an order.
    if (this.order.isOrdered()) {
      sql += '\n';
      sql += this.order.getOrderByString();
    }

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

