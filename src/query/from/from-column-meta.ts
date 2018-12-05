import { ColumnMetadata } from '../../metadata/column/column-metadata';

/**
 * Metadata about columns available to a query (used in [[From]]).
 */
export class FromColumnMeta {
  /**
   * Initialize the metadata.
   * @param tableAlias - The unique alias of the table to which the column
   * belongs.
   * @param columnMetadata - Metadata about the column ([[Column]]-decorated
   * property).
   * @param fqColName - The fully-qualified column name, in the form
   * &lt;table-alias&gt;.&lt;column-name&gt;.
   * @param fqProp - The fully-qualified property name, in the form
   * &lt;table-alias&gt;.&lt;property&gt;.
   */
  constructor(
    public tableAlias: string,
    public columnMetadata: ColumnMetadata,
    public fqColName: string,
    public fqProp: string) {
  }
}

