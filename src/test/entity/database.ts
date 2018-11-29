import { User } from './user.entity';
import { PhoneNumber } from './phone-number.entity';
import { Photo } from './photo.entity';
import { Product } from './product.entity';

import { Column } from '../../database/column.decorator';
import { Table } from '../../database/table.decorator';
import { ManyToOne } from '../../database/many-to-one.decorator';
import { OneToMany } from '../../database/one-to-many.decorator';
import { OneToOne } from '../../database/one-to-one.decorator';

import metaFactory from '../../database/metadata-factory';

// This file clears all the metadata cache and manually decorates each class
// when testing.
export function initDB() {
  let colDec, relDec, tblDec;

  metaFactory.clear();

  // User.
  colDec = Column({name: 'userID', isPrimary: true, isGenerated: true});
  colDec(User.prototype, 'id');

  colDec = Column({maxLength: 255});
  colDec(User.prototype, 'username');

  colDec = Column({name: 'firstName', maxLength: 255});
  colDec(User.prototype, 'first');

  colDec = Column({name: 'lastName', maxLength: 255});
  colDec(User.prototype, 'last');

  colDec = Column();
  colDec(User.prototype, 'createdOn');

  relDec = OneToMany<User, PhoneNumber>(() => PhoneNumber, (u, pn) => [u.id, pn.userID]);
  relDec(User.prototype, 'phoneNumbers');

  tblDec = Table({name: 'users'});
  tblDec(User);

  // PhoneNumber.
  colDec = Column({name: 'phoneNumberID', isPrimary: true, isGenerated: true});
  colDec(PhoneNumber.prototype, 'id');

  colDec = Column();
  colDec(PhoneNumber.prototype, 'phoneNumber');

  colDec = Column();
  colDec(PhoneNumber.prototype, 'type');

  colDec = Column();
  colDec(PhoneNumber.prototype, 'userID');

  relDec = ManyToOne<PhoneNumber, User>(() => User, (pn, u) => [pn.userID, u.id]);
  relDec(PhoneNumber.prototype, 'user');

  tblDec = Table({name: 'phone_numbers'});
  tblDec(PhoneNumber);

  // Product.
  colDec = Column({name: 'productID', isPrimary: true, isGenerated: true});
  colDec(Product.prototype, 'id');

  colDec = Column();
  colDec(Product.prototype, 'description');

  colDec = Column();
  colDec(Product.prototype, 'isActive');

  colDec = Column();
  colDec(Product.prototype, 'primaryPhotoID');

  relDec = OneToOne<Product, Photo>(() => Photo, (prod, photo) => [prod.primaryPhotoID, photo.id]);
  relDec(Product.prototype, 'primaryPhoto');

  relDec = OneToMany<Product, Photo>(() => Photo, (prod, photo) => [prod.id, photo.prodID]);
  relDec(Product.prototype, 'photos');

  tblDec = Table({name: 'products'});
  tblDec(Product);

  // Photo.
  colDec = Column({isPrimary: true, isGenerated: true, name: 'photoID'});
  colDec(Photo.prototype, 'id');

  colDec = Column();
  colDec(Photo.prototype, 'photoURL');

  colDec = Column();
  colDec(Photo.prototype, 'largeThumbnailID');

  colDec = Column();
  colDec(Photo.prototype, 'smallThumbnailID');

  colDec = Column();
  colDec(Photo.prototype, 'prodID');

  relDec = OneToOne<Photo, Photo>(() => Photo, (p1, p2) => [p1.largeThumbnailID, p2.id]);
  relDec(Photo.prototype, 'largeThumbnail');

  relDec = OneToOne<Photo, Photo>(() => Photo, (p1, p2) => [p1.smallThumbnailID, p2.id]);
  relDec(Photo.prototype, 'smallThumbnail');

  relDec = ManyToOne<Photo, Product>(() => Product, (photo, prod) => [photo.prodID, prod.id]);
  relDec(Photo.prototype, 'product');

  tblDec = Table({name: 'photos'});
  tblDec(Photo);
}

