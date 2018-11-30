import { TableMetaOptions } from './table-meta-options';
import { EntityType } from './entity-type';

/**
 * Stores metadata about [[Table]]-decorated classes.
 */
export class TableMetadata {
  /**
   * Initialize the Table's metadata.
   * @param Entity - The constructor for the @[[Table]]-decorated class.
   * @param name - The name of the database table.
   * @param database - The database to which this table belongs.
   */
  constructor(
    public Entity: EntityType,
    public name: string,
    public database: string) {
  }

  /**
   * Produce an entity.
   * @return {any} An instance of Entity type.
   */
  produceEntity(): any {
    return new this.Entity();
  }
}

