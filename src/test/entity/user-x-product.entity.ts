import { Table } from '../../metadata/table/table.decorator';
import { Column } from '../../metadata/column/column.decorator';
import { ManyToOne } from '../../metadata/relationship/many-to-one.decorator';

import { User } from './user.entity';
import { Product } from './product.entity';

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

