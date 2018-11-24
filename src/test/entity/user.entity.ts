import { Table } from '../../database/table.decorator';
import { Column } from '../../database/column.decorator';
import { PhoneNumber } from './phone-number.entity';

@Table({name: 'users'})
export class User {
  @Column({name: 'userID', isPrimary: true, isGenerated: true})
  id: number;

  @Column({maxLength: 255})
  username: string;

  @Column({name: 'firstName', maxLength: 255})
  first: string;

  @Column({name: 'lastName', maxLength: 255})
  last: string;

  @Column()
  createdOn: Date;

  phoneNumbers: PhoneNumber[];
}

