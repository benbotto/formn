/** Represents a foreign key. */
export class ForeignKeyMetadata {
  /**
   * Initialize the foreign key.
   * @param Entity - The type (constructor) of the table that owns this key.
   * @param column - The name of the column in the owning table.
   * @param mapTo - The property to map to in Entity.
   * @param getRefEntity - A function that, when called, returns the referenced
   * Entity type (constructor).
   */
  constructor(
    public Entity: {new(): any},
    public column: string,
    public mapTo: string,
    public getRefEntity: () => {new(): any}) {
  }
}

