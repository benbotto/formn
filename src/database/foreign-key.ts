/** Represents a foreign key. */
export class ForeignKey {
  /**
   * Initialize the foreign key.
   * @param table - The name of the owning table.
   * @param column - The name of the column in the owning table.
   * @param refTable - The name of the referenced table.
   * @param refColumn - The name of the column in the referenced table.
   */
  constructor(
    public table: string,
    public column: string,
    public refTable: string,
    public refColumn: string) {
  }
}

