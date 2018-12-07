/**
 * Result type for inserts, which generally has at least an insertId.
 */
export type InsertResultType = {
  /**
   * Generated identifier of the inserted record.
   */
  insertId?: any;
}

