import { Table } from '../../database/table.decorator';
import { Column } from '../../database/column.decorator';
import { OneToOne } from '../../database/one-to-one.decorator';
import { OneToMany } from '../../database/one-to-many.decorator';
import { Photo } from './photo.entity';

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
}

