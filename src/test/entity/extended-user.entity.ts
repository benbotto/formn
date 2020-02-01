import { Table, Column } from '../../metadata/';

import { User } from '../';

// This class is used for testing inheritence on Table-decorated entities.
@Table({name: 'extended_users'})
export class ExtendedUser extends User {
  @Column({name: 'fullName'})
  fullName: string;
}

