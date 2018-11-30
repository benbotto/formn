import { DatabaseMetaData } from './database-meta-data';
import { ColumnMetadata } from './column-metadata';
import { RelationshipStore } from './relationship-store';

class MetadataFactory {
  private dbMetaMap: Map<string, DatabaseMetaData> = new Map();
  private colMetadata: ColumnMetadata[] = [];
  private relStore: RelationshipStore = new RelationshipStore();

  /**
   * Clear all metadata (useful in unit tests).
   * @return {this}
   */
  clear(): MetadataFactory {
    this.dbMetaMap = new Map();
    this.colMetadata = [];
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
   * Get the global array of ColumnMetadata.
   * @return The metadata for all columns.
   */
  getColumnMetadata(): ColumnMetadata[] {
    return this.colMetadata;
  }

  /**
   * Add a column's metadata.
   * @param col - The metadata about the column.
   * @return {this}
   */
  addColumnMetadata(col: ColumnMetadata): MetadataFactory {
    this.colMetadata.push(col)
    return this;
  }

  /**
   * Get the global RelationshipStore instance.
   */
  getRelationshipStore(): RelationshipStore {
    return this.relStore;
  }
}

export default new MetadataFactory();

