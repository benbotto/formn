import { Validate, EmailValidator } from 'bsy-validation';

import { Table, Column } from '../../metadata/';

// This class is used to test validation.
@Table({name: 'type_test'})
export class TypeTest {
  @Column({isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'})
  int: number;

  @Column({maxLength: 10, sqlDataType: 'varchar'})
  str: string;

  @Column({sqlDataType: 'timestamp'})
  dte: Date;

  @Column({sqlDataType: 'double'})
  num: number;

  @Column({sqlDataType: 'tinyint'})
  bool: boolean;

  @Column({maxLength: 50, sqlDataType: 'varchar'})
  @Validate(new EmailValidator())
  email: string;
}

