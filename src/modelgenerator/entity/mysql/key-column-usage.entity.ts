import { Table, Column } from '../../../metadata/';

@Table({name: 'KEY_COLUMN_USAGE'})
export class KeyColumnUsage {
  @Column({name: 'CONSTRAINT_NAME', isPrimary: true})
  constraintName: string;

  @Column({name: 'COLUMN_NAME', isPrimary: true})
  columnName: string;

  @Column({name: 'TABLE_NAME', isPrimary: true})
  tableName: string;

  @Column({name: 'TABLE_SCHEMA', isPrimary: true})
  schema: string;

  @Column({name: 'REFERENCED_TABLE_NAME'})
  referencedTableName: string;

  @Column({name: 'REFERENCED_COLUMN_NAME'})
  referencedColumnName: string;
}

