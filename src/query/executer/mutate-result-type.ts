/**
 * Result type for update and delete queries, which has at least the number of
 * affected rows.
 */
export type MutateResultType = {
  /**
   * Number of records affected by the update or delete operation.
   */
  affectedRows: number;
}

