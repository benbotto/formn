import { DatabaseMetaData } from './database-meta-data';
import { ColumnMetadata } from './column-metadata';
import { ForeignKeyMetadata } from './foreign-key-metadata';

class MetadataFactory {
  private dbMetaMap: Map<string, DatabaseMetaData> = new Map();
  private colMetadata: ColumnMetadata[] = [];
  private fkMetaData: ForeignKeyMetadata[] = [];

  /**
   * Get the DatabaseMetaData for a database by name.
   * @param {string} [name='default'] - The name of the database, or 'default'
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
   * @return {ColumnMetadata[]} The metadata for all columns.
   */
  getColumnMetadata(): ColumnMetadata[] {
    return this.colMetadata;
  }

  /**
   * Get the global array of ForeignKeyMetadata.
   * @return {ForeignKeyMetadata[]} An array of all foreign key metadata.
   */
  getForeignKeyMetadata(): ForeignKeyMetadata[] {
    return this.fkMetaData;
  }

  /**
   * Add a foreign key's metadata.
   * @param {ForeignKeyMetadata} fk - Metadata about the key.
   * @return {this}
   */
  addForeignKeyMetadata(fk: ForeignKeyMetadata): MetadataFactory {
    this.fkMetaData.push(fk);
    return this;
  }
}

export default new MetadataFactory();

