import { TableMetaOptions } from './table-meta-options';
import { ColumnMetadata } from './column-metadata';
import metaFactory from './metadata-factory';

export class TableMetadata {
  Entity: {new (): any};
  name: string;
  mapTo: string;
  database: string;
  columns: ColumnMetadata[] = [];

  constructor(Entity: {new (): any}, options: TableMetaOptions) {
    this.Entity   = Entity;
    this.name     = options.name;
    this.database = options.database;

    const colMeta = metaFactory.getColumnMetadata();

    for (let col of colMeta) {
      if (col.Entity === this.Entity)
        this.columns.push(col);
    }
  }

  /**
   * Produce an entity.
   * @return {any} An instance of Entity type.
   */
  produceEntity(): any {
    return new this.Entity();
  }

  /**
   * Get the list of columns for this table.
   * @return {ColumnMetadata[]} An array of all column metadata for this table.
   */
  getColumns(): ColumnMetadata[] {
    return this.columns;
  }
}

