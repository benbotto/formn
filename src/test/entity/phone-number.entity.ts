import { Table, Column, ManyToOne } from '../../metadata/';

import { User } from '../';

@Table({name: 'phone_numbers'})
export class PhoneNumber {
  @Column({name: 'phoneNumberID', isPrimary: true, isGenerated: true})
  id: number;

  @Column({isNullable: false})
  phoneNumber: string;

  @Column()
  type: string;

  @Column()
  userID: number;

  @ManyToOne<PhoneNumber, User>(() => User, (pn, u) => [pn.userID, u.id])
  user: User;
}

