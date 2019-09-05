import { Table, Column, OneToMany } from '../../../metadata/';

import { YesNoConverter } from '../../../converter/';

import { IsPrimaryConverter, IsGeneratedConverter,
  HasDefaultConverter, MySQLKeyColumnUsage } from '../../';

@Table({name: 'COLUMNS'})
export class MySQLColumn {
  @Column({name: 'COLUMN_NAME', isPrimary: true})
  name: string;

  @Column({name: 'TABLE_NAME', isPrimary: true})
  tableName: string;

  @Column({name: 'TABLE_SCHEMA', isPrimary: true})
  schema: string;

  @Column({name: 'DATA_TYPE'})
  dataType: string;

  @Column({name: 'COLUMN_TYPE'})
  columnType: string;

  @Column({name: 'IS_NULLABLE', converter: new YesNoConverter()})
  isNullable: boolean;

  @Column({name: 'CHARACTER_MAXIMUM_LENGTH'})
  maxLength: number;

  @Column({name: 'COLUMN_KEY', converter: new IsPrimaryConverter()})
  isPrimary: boolean;

  @Column({name: 'COLUMN_DEFAULT', converter: new HasDefaultConverter()})
  hasDefault: boolean;

  @Column({name: 'EXTRA', converter: new IsGeneratedConverter()})
  isGenerated: boolean;

  @OneToMany<MySQLColumn, MySQLKeyColumnUsage>(
    () => MySQLKeyColumnUsage,
    (c, fk) => [
      [c.tableName, fk.tableName],
      [c.schema, fk.schema],
      [c.name, fk.columnName]
    ])
  keyColumnUsage: MySQLKeyColumnUsage[];
}

