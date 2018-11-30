import { ColumnMetadata } from './column-metadata';
import { PropertyMapType } from './property-map-type';

/** Storage for ColumnMetadata with lookup operations. */
export class ColumnStore {
  private colMetadata: ColumnMetadata[] = [];
  private tableCols: Map<{new(): any}, ColumnMetadata[]> = new Map();
  private propMaps: Map<{new(): any}, PropertyMapType> = new Map();

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
  getColumnMetadata(Entity: {new(): any}): ColumnMetadata[] {
    return this.tableCols.get(Entity);
  }

  /**
   * Get the property map for a table.
   */
  getPropertyMap(Entity: {new(): any}): PropertyMapType {
    return this.propMaps.get(Entity);
  }
}
