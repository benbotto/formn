import { Select } from '../';

/**
 * Represents a SELECT query for MySQL.
 */
export class MySQLSelect<T> extends Select<T> {
  /**
   * Get the SQL that represents the query.
   * @return The SQL representing the select statement.
   */
  toString(): string {
    let sql = this.getSelectString();

    // Add the FROM (which includes the JOINS and WHERE).
    sql += '\n';
    sql += this.from.toString();

    // Add the order if there is an order.
    if (this.order.isOrdered()) {
      sql += '\n';
      sql += this.order.getOrderByString();
    }

    // Add the limit (offset and row count) if there is a limit.
    if (this.rowCount !== undefined) {
      sql += '\n';
      sql += `LIMIT   ${this.offset}, ${this.rowCount}`
    }

    return sql;
  }
}

