import { ColumnMetadata } from './column-metadata';
import { EntityType } from '../table/entity-type';
import { assert } from '../../error/assert';

/** Storage for [[ColumnMetadata]] with lookup operations. */
export class ColumnStore {
  private colMetadata: ColumnMetadata[] = [];
  private tableCols: Map<EntityType, ColumnMetadata[]> = new Map();

  /**
   * Add a column's metadata.
   */
  addColumnMetadata(col: ColumnMetadata): this {
    this.colMetadata.push(col)

    // Keep a local map of Table to Columns.
    if (!this.tableCols.has(col.Entity))
      this.tableCols.set(col.Entity, []);

    this.tableCols
      .get(col.Entity)
      .push(col);

    return this;
  }

  /**
   * Get all the [[ColumnMetadata]] for a [[Table]]-decorated Entity.
   */
  getColumnMetadata(Entity: EntityType): ColumnMetadata[] {
    const cols = this.tableCols.get(Entity);

    assert(cols, `Failed to get column metadata for type "${Entity.name}."  The type must be decorated with @Table.`);

    return cols;
  }

  /**
   * Get the [[ColumnMetadata]] for a [[Table]]-decorated Entity by column name.
   */
  getColumnMetadataByName(Entity: EntityType, name: string): ColumnMetadata {
    const cols = this.getColumnMetadata(Entity);
    const col  = cols.find(col => col.name === name);

    assert(col, `Column "${name}" does not exist in table "${Entity.name}."`);

    return col;
  }

  /**
   * Get the [[ColumnMetadata]] for a [[Table]]-decorated Entity by column
   * mapping (property name in parent Entity).
   */
  getColumnMetadataByMapping(Entity: EntityType, mapTo: string): ColumnMetadata {
    const cols = this.getColumnMetadata(Entity);
    const col  = cols.find(col => col.mapTo === mapTo);

    assert(col, `Column with mapping "${mapTo}" does not exist in table "${Entity.name}."`);

    return col;
  }

  /**
   * Get the primary key for a table.
   */
  getPrimaryKey(Entity: EntityType): ColumnMetadata[] {
    const cols = this.getColumnMetadata(Entity);
    const pk   = cols.filter(col => col.isPrimary);

    assert(pk.length, `Table "${Entity.name}" has no primary keys defined.`);

    return pk;
  }
}

