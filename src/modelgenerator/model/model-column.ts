import { camelCase } from 'change-case';

import { assert } from '../../error/';

import { ColumnMetaOptions } from '../../metadata/';

/**
 * Helper class for model generation that stores column metadata.
 */
export class ModelColumn {
  private metaOptions: ColumnMetaOptions = new ColumnMetaOptions();
  private dataType: string;

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
    if (this.getName())
      return camelCase(this.metaOptions.name);
    return undefined;
  }

  /**
   * Set the name of the column.
   */
  setName(name: string): void {
    this.metaOptions.name = name;
  }

  /**
   * Whether or not this column is the (or part of the) primary key.
   */
  setIsPrimary(isPrimary: boolean): void {
    this.metaOptions.isPrimary = isPrimary;
  }

  /**
   * Whether or not this column is auto-generated.
   */
  setIsGenerated(isGenerated: boolean): void {
    this.metaOptions.isGenerated = isGenerated;
  }
  
  /**
   * Whether or not the column has a default value.
   */
  setHasDefault(hasDefault: boolean): void {
    this.metaOptions.hasDefault = hasDefault;
  }

  /**
   * Whether or not the column is nullable.
   */
  setIsNullable(isNullable: boolean): void {
    this.metaOptions.isNullable = isNullable;
  }

  /**
   * Max length for varchar-type fields.
   */
  setMaxLength(maxLength: number): void {
    this.metaOptions.maxLength = maxLength;
  }

  /**
   * Data type for the column.
   */
  setDataType(dataType: string): void {
    this.dataType = dataType;
  }

  /**
   * Get the metadata as a [[Column]] decorator string.
   */
  getDecoratorString(): string {
    const name        = this.metaOptions.name;
    const propName    = this.getPropertyName();
    const isPrimary   = this.metaOptions.isPrimary;
    const isGenerated = this.metaOptions.isGenerated;
    const hasDefault  = this.metaOptions.hasDefault;
    const isNullable  = this.metaOptions.isNullable;
    const maxLength   = this.metaOptions.maxLength;
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

    if (opts.length)
      return `  @Column({${opts.join(', ')}})`;

    return '  @Column()';
  }

  /**
   * Get the property declaration as a string.
   */
  getPropertyString(): string {
    const propName = this.getPropertyName();

    assert(propName, 'ModelColumn instance has no property name.');
    assert(this.dataType, 'ModelColumn instance has no data type.');

    return `  ${propName}: ${this.dataType}`; 
  }

  /**
   * Convert the column to a string (decorator and property).
   */
  toString(): string {
    return this.getDecoratorString() + '\n' + this.getPropertyString() + ';';
  }
}

