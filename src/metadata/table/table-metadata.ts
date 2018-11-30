import { TableMetaOptions } from './table-meta-options';
import { EntityType } from './entity-type';

export class TableMetadata {
  Entity: EntityType;
  name: string;
  database: string;

  /**
   * Initialize the Table's metadata.
   * @param Entity - The constructor for the Table-decorated class.
   * @param name - The name of the database table.
   * @param database - The database to which this table belongs.
   */
  constructor(Entity: EntityType, name: string, database: string) {
    this.Entity   = Entity;
    this.name     = name;
    this.database = database;
  }

  /**
   * Produce an entity.
   * @return {any} An instance of Entity type.
   */
  produceEntity(): any {
    return new this.Entity();
  }
}

