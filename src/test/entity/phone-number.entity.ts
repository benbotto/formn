import { Table } from '../../metadata/table/table.decorator';
import { Column } from '../../metadata/column/column.decorator';
import { ManyToOne } from '../../metadata/relationship/many-to-one.decorator';
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

