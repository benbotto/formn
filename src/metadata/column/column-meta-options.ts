import { Converter } from '../../converter/';

/**
 * Options for the [[Column]] decorator.
 */
export class ColumnMetaOptions {
  /**
   * Column name.  Defaults to the name of the Column-decorated property.
   */
  name?: string;

  /**
   * Whether or not this column is the (or part of the) primary key.
   */
  isPrimary?: boolean;

  /**
   * Whether or not this column is auto-generated.
   */
  isGenerated?: boolean;

  /**
   * Whether or not the column has a default value.
   */
  hasDefault?: boolean;

  /**
   * Whether or not the column is nullable.
   */
  isNullable?: boolean;

  /**
   * Max length for varchar-type fields.
   */
  maxLength?: number;

  /**
   * Optional Converter to be applied on save/retrieve.
   */
  converter?: Converter;

  /**
   * The datatype in the database.
   */
  sqlDataType?: string;
}

