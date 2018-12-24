/**
 * Maps from MySQL data types to JavaScript types.
 */
export class MySQLDataTypeMapper {
  /**
   * Given the data type and column type of a column return the analogous JS type.
   * @param dataType - The raw type in MySQL, e.g. tinyint, from
   * INFORMATION_SCHEMA.COLUMNS.
   * @param columnType - The column type, e.g., tinyint(1), from MySQL's
   * INFORMATION_SCHEMA.COLUMNS.
   */
  static getJSType(dataType: string, columnType: string): string {
    switch (dataType) {
      case 'int':
      case 'smallint':
      case 'mediumint':
      case 'bigint':
      case 'float':
      case 'double':
        return 'number';
      case 'tinyint':
        if (columnType === 'tinyint(1)')
          return 'boolean';
        return 'number';
      case 'bit':
        return 'Buffer';
      case 'date':
      case 'datetime':
      case 'timestamp':
        return 'Date';
      default:
        return 'string';
    }
  }
}

