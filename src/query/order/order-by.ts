import { assert } from '../../error/';

import { OrderByType, Escaper, From } from '../';

/**
 * Used by Query classes that can be ordered, like [[Select]] and [[Count]].
 */
export class OrderBy {
  // The order of the query.
  protected order: OrderByType[] = [];

  /**
   * Initialize with a From instance.
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]]).  Used when escaping column names in
   * compiled conditions.
   * @param from - A [[From]] instance which holds the base table, all
   * joined-in tables, and the where clause.
   */
  constructor(
    protected escaper: Escaper,
    protected from: From) {
  }

  /**
   * Order by one or more columns.
   * @param orders - A list of fully-qualified properties in the form
   * &lt;table-alias&gt;.&lt;property&gt;, or an array of [[OrderByType]] with
   * the fully-qualified property and direction.
   */
  orderBy(...orders: OrderByType[] | string[]): this {
    // orderBy may only be called once.
    assert(!this.isOrdered(), 'orderBy already performed on query.');

    for (let i = 0; i < orders.length; ++i) {
      const order: OrderByType = typeof orders[i] === 'string' ?
        {property: orders[i], dir: 'ASC'} as OrderByType :
        orders[i] as OrderByType;

      // Make sure the column is available for ordering.
      const fromMeta = this.from.getFromMeta();

      assert(fromMeta.isColumnAvailable(order.property),
        `"${order.property}" is not available for orderBy.`);

      this.order.push(order);
    }

    return this;
  }

  /**
   * Get the ORDER BY portion of the query string, or an empty string if there
   * is no order.
   */
  getOrderByString(): string {
    if (this.isOrdered()) {
      const fromMeta = this.from.getFromMeta();
      let   sql      = 'ORDER BY '

      sql += this.order
        .map(order => {
          const colMeta = fromMeta.getFromColumnMetaByProp(order.property);
          const colName = this.escaper.escapeFullyQualifiedColumn(colMeta.fqColName);

          return `${colName} ${order.dir}`;
        })
        .join(', ');

      return sql;
    }

    return '';
  }

  /**
   * Returns true if the query is ordered.
   */
  isOrdered(): boolean {
    return this.order.length !== 0;
  }
}

