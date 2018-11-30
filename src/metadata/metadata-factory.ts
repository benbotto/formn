import { TableStore } from './table/table-store';
import { ColumnStore } from './column/column-store';
import { RelationshipStore } from './relationship/relationship-store';

class MetadataFactory {
  private tblStore: TableStore = new TableStore();
  private colStore: ColumnStore = new ColumnStore();
  private relStore: RelationshipStore = new RelationshipStore();

  /**
   * Clear all metadata (useful in unit tests).
   * @return {this}
   */
  clear(): MetadataFactory {
    this.tblStore = new TableStore();
    this.colStore = new ColumnStore();
    this.relStore = new RelationshipStore();

    return this;
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

