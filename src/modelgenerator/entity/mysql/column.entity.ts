import { Table, Column as FColumn, OneToMany } from '../../../metadata/';

import { YesNoConverter, IsPrimaryConverter, IsGeneratedConverter,
  KeyColumnUsage } from '../../';

@Table({name: 'COLUMNS'})
export class Column {
  @FColumn({name: 'COLUMN_NAME', isPrimary: true})
  name: string;

  @FColumn({name: 'TABLE_NAME', isPrimary: true})
  tableName: string;

  @FColumn({name: 'TABLE_SCHEMA', isPrimary: true})
  schema: string;

  @FColumn({name: 'DATA_TYPE'})
  dataType: string;

  @FColumn({name: 'COLUMN_TYPE'})
  columnType: string;

  @FColumn({name: 'IS_NULLABLE', converter: new YesNoConverter()})
  isNullable: boolean;

  @FColumn({name: 'CHARACTER_MAXIMUM_LENGTH'})
  maxLength: number;

  @FColumn({name: 'COLUMN_KEY', converter: new IsPrimaryConverter()})
  isPrimary: boolean;

  @FColumn({name: 'COLUMN_DEFAULT'})
  default: string;

  @FColumn({name: 'EXTRA', converter: new IsGeneratedConverter()})
  isGenerated: boolean;
  
  @OneToMany<Column, KeyColumnUsage>(
    () => KeyColumnUsage,
    (c, fk) => [
      [c.tableName, fk.tableName],
      [c.schema, fk.schema],
      [c.name, fk.columnName]
    ])
  keyColumnUsage: KeyColumnUsage[];
}

