import { assert } from '../../error/';

import { ColumnMetaOptions } from '../../metadata/';

import { ColumnFormatter } from '../';

/**
 * Helper class for model generation that stores column metadata.
 */
export class ModelColumn {
  private metaOptions: ColumnMetaOptions = new ColumnMetaOptions();
  private dataType: string;

  /**
   * Initialize the ModelColumn instance.
   * @param columnFormatter - A [[ColumnFormatter]] instance that is used for
   * formatting property names.
   */
  constructor(
    private columnFormatter: ColumnFormatter) {
  }

  /**
   * Set the name of the column.
   */
  setName(name: string): this {
    this.metaOptions.name = name;

    return this;
  }

  /**
   * Whether or not this column is the (or part of the) primary key.
   */
  setIsPrimary(isPrimary: boolean): this {
    this.metaOptions.isPrimary = isPrimary;

    return this;
  }

  /**
   * Whether or not this column is auto-generated.
   */
  setIsGenerated(isGenerated: boolean): this {
    this.metaOptions.isGenerated = isGenerated;

    return this;
  }

  /**
   * Whether or not the column has a default value.
   */
  setHasDefault(hasDefault: boolean): this {
    this.metaOptions.hasDefault = hasDefault;

    return this;
  }

  /**
   * Whether or not the column is nullable.
   */
  setIsNullable(isNullable: boolean): this {
    this.metaOptions.isNullable = isNullable;

    return this;
  }

  /**
   * Max length for varchar-type fields.
   */
  setMaxLength(maxLength: number): this {
    this.metaOptions.maxLength = maxLength;

    return this;
  }

  /**
   * The datatype in the database.
   */
  setSQLDataType(sqlDataType: string): this {
    this.metaOptions.sqlDataType = sqlDataType;

    return this;
  }

  /**
   * Data type for the column.
   */
  setDataType(dataType: string): this {
    this.dataType = dataType;

    return this;
  }

  /**
   * Get the name of the column.
   */
  getName(): string {
    return this.metaOptions.name;
  }

  /**
   * Get the formatted name of the column, which is camel case.
   */
  getPropertyName(): string {
    return this.columnFormatter.formatPropertyName(this);
  }

  /**
   * Whether or not this column is the (or part of the) primary key.
   */
  getIsPrimary(): boolean {
    return this.metaOptions.isPrimary;
  }

  /**
   * Whether or not this column is auto-generated.
   */
  getIsGenerated(): boolean {
    return this.metaOptions.isGenerated;
  }

  /**
   * Whether or not the column has a default value.
   */
  getHasDefault(): boolean {
    return this.metaOptions.hasDefault;
  }

  /**
   * Whether or not the column is nullable.
   */
  getIsNullable(): boolean {
    return this.metaOptions.isNullable;
  }

  /**
   * Max length for varchar-type fields.
   */
  getMaxLength(): number {
    return this.metaOptions.maxLength;
  }

  /**
   * Get the database datatype.
   */
  getSQLDataType(): string {
    return this.metaOptions.sqlDataType;
  }

  /**
   * Data type for the column.
   */
  getDataType(): string {
    return this.dataType;
  }

  /**
   * Get the metadata as a [[Column]] decorator string.
   */
  getDecoratorString(): string {
    const name        = this.getName();
    const propName    = this.getPropertyName();
    const isPrimary   = this.getIsPrimary();
    const isGenerated = this.getIsGenerated();
    const hasDefault  = this.getHasDefault();
    const isNullable  = this.getIsNullable();
    const maxLength   = this.getMaxLength();
    const sqlDataType = this.getSQLDataType();
    const opts        = [];

    if (name && name !== propName)
      opts.push(`name: '${name}'`);

    if (isPrimary)
      opts.push('isPrimary: true');

    if (isGenerated)
      opts.push('isGenerated: true');

    if (hasDefault)
      opts.push('hasDefault: true');

    if (isNullable === false)
      opts.push('isNullable: false');

    if (maxLength)
      opts.push(`maxLength: ${maxLength}`);

    if (sqlDataType)
      opts.push(`sqlDataType: '${sqlDataType}'`);

    if (opts.length)
      return `  @Column({${opts.join(', ')}})`;

    return '  @Column()';
  }

  /**
   * Get the property declaration as a string.
   */
  getPropertyString(): string {
    assert(this.getName(), 'ModelColumn instance has no name.');
    assert(this.getDataType(), 'ModelColumn instance has no data type.');

    const propName = this.getPropertyName();

    return `  ${propName}: ${this.getDataType()}`;
  }

  /**
   * Convert the column to a string (decorator and property).
   */
  toString(): string {
    return this.getDecoratorString() + '\n' + this.getPropertyString() + ';';
  }
}

