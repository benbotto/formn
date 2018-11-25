import { Table } from '../../database/table.decorator';
import { Column } from '../../database/column.decorator';
import { ForeignKey } from '../../database/foreign-key.decorator';
import { User } from './user.entity';

@Table({name: 'phone_numbers'})
export class PhoneNumber {
  @Column({name: 'phoneNumberID', isPrimary: true, isGenerated: true})
  id: number;

  @Column()
  phoneNumber: string;

  @Column()
  type: string;

  @Column()
  userID: number;

  @ForeignKey({column: 'userID', getReferencedTable: () => User})
  user: User;
}

