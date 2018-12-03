import { Table } from '../../metadata/table/table.decorator';
import { Column } from '../../metadata/column/column.decorator';
import { OneToMany } from '../../metadata/relationship/one-to-many.decorator';

import { PhoneNumber } from './phone-number.entity';
import { UserXProduct } from './user-x-product.entity';

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

  @OneToMany<User, PhoneNumber>(() => PhoneNumber, (u, pn) => [u.id, pn.userID])
  phoneNumbers: PhoneNumber[];

  @OneToMany<User, UserXProduct>(() => UserXProduct, (u, uxp) => [u.id, uxp.userID])
  userXProducts: UserXProduct[];
}

