import { User } from './user.entity';
import { PhoneNumber } from './phone-number.entity';
import { Photo } from './photo.entity';
import { Product } from './product.entity';

import { Column } from '../../database/column.decorator';
import { Table } from '../../database/table.decorator';
import { ForeignKey } from '../../database/foreign-key.decorator';

import metaFactory from '../../database/metadata-factory';

// This file clears all the metadata cache and manually decorates each class
// when testing.
export function initDB() {
  let colDec, fkDec, tblDec;

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

  fkDec = ForeignKey({column: 'userID', getReferencedTable: () => User});
  fkDec(PhoneNumber.prototype, 'user');

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

  fkDec = ForeignKey({column: 'primaryPhotoID', getReferencedTable: () => Photo});
  fkDec(Product.prototype, 'primaryPhoto');

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

  fkDec = ForeignKey({column: 'largeThumbnailID', getReferencedTable: () => Photo});
  fkDec(Photo.prototype, 'largeThumbnail');

  fkDec = ForeignKey({column: 'smallThumbnailID', getReferencedTable: () => Photo});
  fkDec(Photo.prototype, 'smallThumbnail');

  fkDec = ForeignKey({column: 'prodID', getReferencedTable: () => Product}) // Circular.;
  fkDec(Photo.prototype, 'product');

  tblDec = Table({name: 'photos'});
  tblDec(Photo);
}

