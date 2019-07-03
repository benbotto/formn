import { Table, Column } from '../metadata/';

/**
 * Entity for the formn_migrations table.
 */
@Table({name: 'formn_migrations'})
export class FormnMigration {
  @Column({isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'})
  id: number;

  @Column({isNullable: false, maxLength: 255})
  name: string;

  @Column({hasDefault: true, isNullable: false})
  runOn: Date;
}

