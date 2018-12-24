import { assert } from '../../error/';

import { TableMetadata, TableType } from '../';

/** Provides storage and lookup operations for [[Table]]-decorated entities. */
export class TableStore {
  private tblMetadata: TableMetadata[] = [];
  private tblMap: Map<TableType, TableMetadata> = new Map();

  /**
   * Add a Table's metadata to the store.
   */
  addTableMetadata(tbl: TableMetadata): this {
    this.tblMetadata.push(tbl);

    // Keep a map of Entity to TableMetadata.
    this.tblMap.set(tbl.Entity, tbl);

    return this;
  }

  /**
   * Get a table by type.
   */
  getTable(Entity: TableType): TableMetadata {
    const tbl = this.tblMap.get(Entity);

    assert(tbl, `Table "${Entity.name}" not found in TableStore.  It must be decorated with @Table.`);

    return tbl;
  }
}

