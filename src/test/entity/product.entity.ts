import { Table } from '../../metadata/table/table.decorator';
import { Column } from '../../metadata/column/column.decorator';
import { OneToOne } from '../../metadata/relationship/one-to-one.decorator';
import { OneToMany } from '../../metadata/relationship/one-to-many.decorator';

import { Photo } from './photo.entity';
import { UserXProduct } from './user-x-product';

@Table({name: 'products'})
export class Product {
  @Column({name: 'productID', isPrimary: true, isGenerated: true})
  id: number;

  @Column()
  description: string;

  @Column()
  isActive: boolean;

  @Column()
  primaryPhotoID: number;

  // This is circular because each photo is of a product, and each product has
  // a primary photo.
  // photo--->product--->primaryPhoto--->products
  //                 |-->photos
  @OneToOne<Product, Photo>(() => Photo, (prod, photo) => [prod.primaryPhotoID, photo.id])
  primaryPhoto: Photo;

  @OneToMany<Product, Photo>(() => Photo, (prod, photo) => [prod.id, photo.prodID])
  photos: Photo[];

  @OneToMany<Product, UserXProduct>(() => UserXProduct, (p, uxp) => [p.id, uxp.productID])
  userXProducts: UserXProduct[];
}

