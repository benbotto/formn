import { assert } from '../../error/assert';

/**
 * Helper class that maps between column aliases and fully-qualified column
 * names.  Users of formn always deal with properties ([[Column]]-decorated
 * properties of [[Table]]-decorated classes), and those properties need to be
 * mapped to column names when querying.  This class helps with that mapping
 * process.
 */
export class ColumnLookup {
  private colMap: Map<string, string> = new Map();

  /**
   * Add a lookup from property to column.
   * @param property - The property name.
   * @param fqColName - Generally this is a fully-qualified column name (see
   * [[ColumnMetadata.createFQName]]), but it can be any string that's
   * associated with property.
   */
  addColumn(property: string, fqColName: string): ColumnLookup {
    this.colMap.set(property, fqColName);

    return this;
  }

  /**
   * Get the column associated with property or throw.
   */
  getColumn(property: string): string {
    assert(this.colMap.has(property), `Property "${property}" not found in ColumnLookup.`);

    return this.colMap.get(property);
  }
}

