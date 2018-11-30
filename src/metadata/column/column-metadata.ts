import { ColumnMetaOptions } from './column-meta-options';
import { Converter } from '../../converter/converter';
import { EntityType } from '../table/entity-type';

/**
 * Stores metadata about [[Column]]-decorated properties on
 * [[Table]]-decorated classes (Entities).
 */
export class ColumnMetadata {
  Entity: EntityType;
  mapTo: string;
  name: string;
  isPrimary: boolean;
  isGenerated:boolean;
  defaultValue: string;
  isNullable: boolean;
  dataType: string;
  maxLength?: number;
  converter?: Converter;

  /**
   * Initialize the metadata for a column.
   * @param Entity The constructor for the [[Table]]-decorated class to which this
   * column belongs.
   * @param mapTo The name of the property in the class to which this
   * column will be mapped.
   * @param options Configuration options for this column with
   * metadata like dataType, column name, etc.
   */
  constructor(
    Entity: EntityType,
    mapTo: string,
    options: ColumnMetaOptions) {

    this.Entity       = Entity;
    this.mapTo        = mapTo;

    this.name         = options.name;
    this.isPrimary    = options.isPrimary || false;
    this.isGenerated  = options.isGenerated || false;
    this.defaultValue = options.defaultValue || null;
    this.dataType     = options.dataType;
    this.maxLength    = options.maxLength;
    this.isNullable   = options.isNullable === undefined ? true : options.isNullable;
    this.converter    = options.converter;
  }

  /**
   * Create a fully-qualified column name in the form
   * &lt;table-alias&gt;.&lt;column-name&gt;.
   * @param tableAlias - The alias for the table.
   * @param colName - The column name.
   * @return The fully-qualified column name, unescaped.
   */
  static createFQColName(tableAlias: string, colName: string): string {
    return `${tableAlias}.${colName}`;
  }
}

