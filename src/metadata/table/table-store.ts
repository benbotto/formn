import { TableMetadata } from './table-metadata';
import { assert } from '../../error/assert';
import { TableType } from './table-type';

/** Provides storage and lookup operations for [[Table]]-decorated entities. */
export class TableStore {
  private tblMetadata: TableMetadata[] = [];
  private tblMap: Map<TableType, TableMetadata> = new Map();
  private dbMap: Map<string, TableMetadata[]> = new Map();

  /**
   * Add a Table's metadata to the store.
   */
  addTableMetadata(tbl: TableMetadata): this {
    this.tblMetadata.push(tbl);

    // Keep a lookup of database name to TableMetadata.
    if (!this.dbMap.has(tbl.database))
      this.dbMap.set(tbl.database, []);

    this.dbMap
      .get(tbl.database)
      .push(tbl);

    // Keep a map of Entity to TableMetadata.
    this.tblMap.set(tbl.Entity, tbl);

    return this;
  }

  /**
   * Get all the TableMetadata for a database.
   */
  getTableMetadata(database: string = 'default'): TableMetadata[] {
    const tbls = this.dbMap.get(database);

    assert(tbls, `Database "${database}" does not exist in TableStore.`);

    return tbls;
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

