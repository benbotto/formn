/**
 * Options for the [[Table]] decorator.
 */
export class TableMetaOptions {
  /**
   * Table name.  Defaults to the [[Table]]-decorated class name.
   */
  name?: string;

  /**
   * The database the table belongs to.
   */
  database?: string;
}

