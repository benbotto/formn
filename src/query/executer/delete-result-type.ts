/**
 * Result type for delete queries, which has at least the number of affected
 * rows.
 */
export type DeleteResultType = {
  /**
   * Number of records affected by the delete.
   */
  affectedRows: number;
}

