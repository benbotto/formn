import { TableMetaOptions } from './table-meta-options';
import { ColumnMetadata } from '../column/column-metadata';

export class TableMetadata {
  Entity: {new (): any};
  name: string;
  mapTo: string;
  database: string;

  constructor(Entity: {new (): any}, options: TableMetaOptions) {
    this.Entity   = Entity;
    this.name     = options.name;
    this.database = options.database;
  }

  /**
   * Produce an entity.
   * @return {any} An instance of Entity type.
   */
  produceEntity(): any {
    return new this.Entity();
  }
}

