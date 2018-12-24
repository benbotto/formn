import { TableMetaOptions, TableType } from '../';

/**
 * Stores metadata about [[Table]]-decorated classes.
 */
export class TableMetadata {
  /**
   * Initialize the Table's metadata.
   * @param Entity - The constructor for the @[[Table]]-decorated class.
   * @param name - The name of the database table.
   * @param schema - The database schema, if any.
   */
  constructor(
    public Entity: TableType,
    public name: string,
    public schema?: string) {
  }

  /**
   * Produce an entity.
   * @return An instance of Entity type.
   */
  produceEntity(): any {
    return new this.Entity();
  }

  /**
   * Get the fully-qualified table name in the form
   * &lt;schema&gt;.&lt;name&gt;.
   */
  getFQName(): string {
    if (this.schema === undefined)
      return this.name;

    return `${this.schema}.${this.name}`;
  }
}

