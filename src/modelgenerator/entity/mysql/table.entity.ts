import { Table as FTable, Column as FColumn, OneToMany } from '../../../metadata/';
import { Column } from '../../';

@FTable({name: 'TABLES'})
export class Table {
  @FColumn({name: 'TABLE_NAME', isPrimary: true})
  name: string;

  @FColumn({name: 'TABLE_SCHEMA', isPrimary: true})
  schema: string;

  @FColumn({name: 'TABLE_TYPE'})
  type: string;

  @OneToMany<Table, Column>(
    () => Column,
    (t, c) => [[t.name, c.tableName], [t.schema, c.schema]])
  columns: Column[];
}

