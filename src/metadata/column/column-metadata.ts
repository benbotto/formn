import { Converter } from '../../converter/';

import { ColumnMetaOptions, TableType } from '../';

/**
 * Stores metadata about [[Column]]-decorated properties on
 * [[Table]]-decorated classes (Entities).
 */
export class ColumnMetadata {
  Entity: TableType;
  mapTo: string;
  name: string;
  isPrimary: boolean;
  isGenerated:boolean;
  hasDefault: boolean;
  isNullable: boolean;
  dataType: string;
  maxLength?: number;
  sqlDataType?: string;
  converter?: Converter;

  /**
   * Initialize the metadata for a column.
   * @param Entity - The constructor for the [[Table]]-decorated class to which this
   * column belongs.
   * @param mapTo - The name of the property in the class to which this
   * column will be mapped.
   * @param dataType - The JavaScript datatype of the property.
   * @param options - Configuration options for this column with
   * metadata like dataType, column name, etc.
   */
  constructor(
    Entity: TableType,
    mapTo: string,
    dataType: string,
    options: ColumnMetaOptions) {

    this.Entity      = Entity;
    this.mapTo       = mapTo;
    this.dataType    = dataType;

    this.name        = options.name;
    this.isPrimary   = options.isPrimary || false;
    this.isGenerated = options.isGenerated || false;
    this.hasDefault  = options.hasDefault || false;
    this.maxLength   = options.maxLength;
    this.isNullable  = options.isNullable === undefined ? true : options.isNullable;
    this.converter   = options.converter;
    this.sqlDataType = options.sqlDataType;
  }

  /**
   * Create a fully-qualified name in the form
   * &lt;table-alias&gt;.&lt;name&gt;.
   * @param tableAlias - The alias for the table.
   * @param colName - The name of a column or property.
   * @return The fully-qualified column name, unescaped.
   */
  static createFQName(tableAlias: string, colName: string): string {
    return `${tableAlias}.${colName}`;
  }

  /**
   * Make a clone.
   */
  clone(): ColumnMetadata {
    const options = new ColumnMetaOptions();

    options.name        = this.name;
    options.isPrimary   = this.isPrimary;
    options.isGenerated = this.isGenerated;
    options.hasDefault  = this.hasDefault;
    options.maxLength   = this.maxLength;
    options.isNullable  = this.isNullable;
    options.converter   = this.converter;
    options.sqlDataType = this.sqlDataType;

    return new ColumnMetadata(this.Entity, this.mapTo, this.dataType, options);
  }
}

