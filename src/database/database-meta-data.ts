import { TableMetadata } from './table-metadata';

export class DatabaseMetaData {
  private tables: TableMetadata[] = [];

  constructor(private name: string) {
  }

  /**
   * Add a Table.
   * @param {TableMetadata} - The metadata about the table.
   * @return {this}
   */
  addTable(table: TableMetadata): DatabaseMetaData {
    this.tables.push(table);

    return this;
  }

  /**
   * Get the array of tables.
   * @return {TableMetadata[]} The array of tables.
   */
  getTables(): TableMetadata[] {
    return this.tables;
  }
}

