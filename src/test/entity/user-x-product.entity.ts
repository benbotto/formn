import { Table, Column, ManyToOne } from '../../metadata/';

import { User, Product } from '../';

@Table({name: 'users_x_products'})
export class UserXProduct {
  @Column({isPrimary: true})
  userID: number;

  @Column({isPrimary: true})
  productID: number;

  @ManyToOne<UserXProduct, User>(() => User, (uxp, u) => [uxp.userID, u.id])
  user: User;

  @ManyToOne<UserXProduct, Product>(() => Product, (uxp, p) => [uxp.productID, p.id])
  product: Product;
}

