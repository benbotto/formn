import { DatabaseMetaData } from './database/database-metadata';
import { TableStore } from './table/table-store';
import { ColumnStore } from './column/column-store';
import { RelationshipStore } from './relationship/relationship-store';

class MetadataFactory {
  private dbMetaMap: Map<string, DatabaseMetaData> = new Map();
  private tblStore: TableStore = new TableStore();
  private colStore: ColumnStore = new ColumnStore();
  private relStore: RelationshipStore = new RelationshipStore();

  /**
   * Clear all metadata (useful in unit tests).
   * @return {this}
   */
  clear(): MetadataFactory {
    this.dbMetaMap = new Map();
    this.tblStore = new TableStore();
    this.colStore = new ColumnStore();
    this.relStore = new RelationshipStore();

    return this;
  }

  /**
   * Get the DatabaseMetaData for a database by name.
   * @param [name='default'] - The name of the database, or 'default'
   * if not provided.
   * @return {DatabaseMetaData}
   */
  getDatabaseMetaData(name: string = 'default'): DatabaseMetaData {
    if (!this.dbMetaMap.has(name))
      this.dbMetaMap.set(name, new DatabaseMetaData(name));

    return this.dbMetaMap.get(name);
  }

  /**
   * Get the global TableStore instance.
   */
  getTableStore(): TableStore {
    return this.tblStore;
  }

  /**
   * Get the global ColumnStore instance.
   */
  getColumnStore(): ColumnStore {
    return this.colStore;
  }

  /**
   * Get the global RelationshipStore instance.
   */
  getRelationshipStore(): RelationshipStore {
    return this.relStore;
  }
}

export default new MetadataFactory();

