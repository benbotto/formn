import { ColumnMetadata } from '../metadata/';

/**
 * This class is used to store column name-[[ColumnMetadata]] associations in a
 * [[Schema]] instance.
 */
export class SchemaColumn {
  /**
   * Initialize the SchemaColumn instance.
   * @param meta - Metadata about the column.
   * @param name - Name of the column in the to-be-serialized query.
   */
  constructor(
    public meta: ColumnMetadata,
    public name: string) {
  }
}

