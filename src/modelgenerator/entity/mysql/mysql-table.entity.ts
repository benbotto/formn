import { Table, Column, OneToMany } from '../../../metadata/';
import { MySQLColumn } from '../../';

@Table({name: 'TABLES'})
export class MySQLTable {
  @Column({name: 'TABLE_NAME', isPrimary: true})
  name: string;

  @Column({name: 'TABLE_SCHEMA', isPrimary: true})
  schema: string;

  @Column({name: 'TABLE_TYPE'})
  type: string;

  @OneToMany<MySQLTable, MySQLColumn>(
    () => MySQLColumn,
    (t, c) => [[t.name, c.tableName], [t.schema, c.schema]])
  columns: MySQLColumn[];
}

