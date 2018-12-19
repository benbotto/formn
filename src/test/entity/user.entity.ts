import { Table, Column, OneToMany } from '../../metadata/';

import { PhoneNumber, UserXProduct } from '../';

@Table({name: 'users'})
export class User {
  @Column({name: 'userID', isPrimary: true, isGenerated: true})
  id: number;

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

