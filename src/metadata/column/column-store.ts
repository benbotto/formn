import { ColumnMetadata } from './column-metadata';
import { PropertyMapType } from './property-map-type';
import { EntityType } from '../table/entity-type';
import { assert } from '../../error/assert';

/** Storage for ColumnMetadata with lookup operations. */
export class ColumnStore {
  private colMetadata: ColumnMetadata[] = [];
  private tableCols: Map<EntityType, ColumnMetadata[]> = new Map();
  private propMaps: Map<EntityType, PropertyMapType> = new Map();

  /**
   * Add a column's metadata.
   */
  addColumnMetadata(col: ColumnMetadata): ColumnStore {
    this.colMetadata.push(col)

    // Keep a local map of Table to Columns.
    if (!this.tableCols.has(col.Entity))
      this.tableCols.set(col.Entity, []);

    this.tableCols
      .get(col.Entity)
      .push(col);

    // Keep a local map of Table to Property names.
    // (See RelationshipMetaOptions: This is what's passed to "on.").
    if (!this.propMaps.has(col.Entity))
      this.propMaps.set(col.Entity, {});

    const pm = this.propMaps
      .get(col.Entity);

    pm[col.mapTo] = col.mapTo;

    return this;
  }

  /**
   * Get all the ColumnMetadata for a Table-decorated Entity.
   */
  getColumnMetadata(Entity: EntityType): ColumnMetadata[] {
    const cols = this.tableCols.get(Entity);

    assert(cols, `Failed to get column metadata for type "${Entity.name}."  The type must be decorated with @Table.`);

    return cols;
  }

  /**
   * Get the property map for a table.
   */
  getPropertyMap(Entity: EntityType): PropertyMapType {
    const pm = this.propMaps.get(Entity);

    assert(pm, `Failed to get property map for type "${Entity.name}."  The type must be decorated with @Table.`);

    return pm
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

