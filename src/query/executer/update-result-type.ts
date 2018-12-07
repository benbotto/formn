/**
 * Result type for update queries, which has at least the number of affected
 * rows.
 */
export type UpdateResultType = {
  /**
   * Number of records affected by the update.
   */
  affectedRows: number;
}

