import { Table, Column, OneToOne, OneToMany } from '../../metadata/';

import { Photo, UserXProduct } from '../';

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

