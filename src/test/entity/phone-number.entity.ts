import { Table } from '../../database/table.decorator';
import { Column } from '../../database/column.decorator';
import { ManyToOne } from '../../database/many-to-one.decorator';
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

  @ManyToOne<PhoneNumber, User>(() => User, (pn, u) => [pn.userID, u.id])
  user: User;
}

