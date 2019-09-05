import { validationFactory, Validate, EmailValidator } from 'bsy-validation';

import {
  User, PhoneNumber, Photo, Product, UserXProduct, Vehicle, VehiclePackage,
  TypeTest
} from '../';

import { FormnMigration } from '../../migrator/';

import { Column, Table, ManyToOne, OneToMany, OneToOne, metaFactory } from '../../metadata/';

import { YesNoConverter } from '../../converter/';

import {
  MySQLTable,
  MySQLColumn,
  MySQLKeyColumnUsage,
  IsGeneratedConverter as MySQLIsGeneratedConverter,
  IsPrimaryConverter as MySQLIsPrimaryConverter,
  HasDefaultConverter
} from '../../modelgenerator/';

// This file clears all the metadata cache and manually decorates each class
// when testing.
export function initDB() {
  let colDec, relDec, tblDec, valDec;

  metaFactory.clear();
  validationFactory.clear();

  // User.
  colDec = Column({name: 'userID', isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'});
  colDec(User.prototype, 'id');

  colDec = Column({name: 'firstName', maxLength: 255, sqlDataType: 'varchar'});
  colDec(User.prototype, 'first');

  colDec = Column({name: 'lastName', maxLength: 255, sqlDataType: 'varchar'});
  colDec(User.prototype, 'last');

  colDec = Column({hasDefault: true, isNullable: false, sqlDataType: 'timestamp'});
  colDec(User.prototype, 'createdOn');

  relDec = OneToMany<User, PhoneNumber>(() => PhoneNumber, (u, pn) => [u.id, pn.userID]);
  relDec(User.prototype, 'phoneNumbers');

  relDec = OneToMany<User, UserXProduct>(() => UserXProduct, (u, uxp) => [u.id, uxp.userID]);
  relDec(User.prototype, 'userXProducts');

  tblDec = Table({name: 'users'});
  tblDec(User);

  // PhoneNumber.
  colDec = Column({name: 'phoneNumberID', isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'});
  colDec(PhoneNumber.prototype, 'id');

  colDec = Column({isNullable: false, maxLength: 255, sqlDataType: 'varchar'});
  colDec(PhoneNumber.prototype, 'phoneNumber');

  colDec = Column({maxLength: 255, sqlDataType: 'varchar'});
  colDec(PhoneNumber.prototype, 'type');

  colDec = Column({name: 'userID', isNullable: false, sqlDataType: 'int'});
  colDec(PhoneNumber.prototype, 'userID');

  relDec = ManyToOne<PhoneNumber, User>(() => User, (pn, u) => [pn.userID, u.id]);
  relDec(PhoneNumber.prototype, 'user');

  tblDec = Table({name: 'phone_numbers'});
  tblDec(PhoneNumber);

  // Product.
  colDec = Column({name: 'productID', isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'});
  colDec(Product.prototype, 'id');

  colDec = Column({isNullable: false, maxLength: 255, sqlDataType: 'varchar'});
  colDec(Product.prototype, 'description');

  colDec = Column({hasDefault: true, isNullable: false, sqlDataType: 'tinyint'});
  colDec(Product.prototype, 'isActive');

  colDec = Column({name: 'primaryPhotoID', sqlDataType: 'int'});
  colDec(Product.prototype, 'primaryPhotoID');

  relDec = OneToOne<Product, Photo>(() => Photo, (prod, photo) => [prod.primaryPhotoID, photo.id]);
  relDec(Product.prototype, 'primaryPhoto');

  relDec = OneToMany<Product, Photo>(() => Photo, (prod, photo) => [prod.id, photo.prodID]);
  relDec(Product.prototype, 'photos');

  relDec = OneToMany<Product, UserXProduct>(() => UserXProduct, (p, uxp) => [p.id, uxp.productID]);
  relDec(Product.prototype, 'userXProducts');

  tblDec = Table({name: 'products'});
  tblDec(Product);

  // Photo.
  colDec = Column({name: 'photoID', isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'});
  colDec(Photo.prototype, 'id');

  colDec = Column({name: 'photoURL', isNullable: false, maxLength: 1000, sqlDataType: 'varchar'});
  colDec(Photo.prototype, 'photoURL');

  colDec = Column({name: 'largeThumbnailID', sqlDataType: 'int'});
  colDec(Photo.prototype, 'largeThumbnailID');

  colDec = Column({name: 'smallThumbnailID', sqlDataType: 'int'});
  colDec(Photo.prototype, 'smallThumbnailID');

  colDec = Column({name: 'prodID', isNullable: false, sqlDataType: 'int'});
  colDec(Photo.prototype, 'prodID');

  relDec = OneToOne<Photo, Photo>(() => Photo, (p1, p2) => [p1.largeThumbnailID, p2.id]);
  relDec(Photo.prototype, 'largeThumbnail');

  relDec = OneToOne<Photo, Photo>(() => Photo, (p1, p2) => [p1.smallThumbnailID, p2.id]);
  relDec(Photo.prototype, 'smallThumbnail');

  relDec = ManyToOne<Photo, Product>(() => Product, (photo, prod) => [photo.prodID, prod.id]);
  relDec(Photo.prototype, 'product');

  tblDec = Table({name: 'photos'});
  tblDec(Photo);

  // UserXProduct.
  colDec = Column({name: 'userID', isPrimary: true, isNullable: false, sqlDataType: 'int'});
  colDec(UserXProduct.prototype, 'userID');

  colDec = Column({name: 'productID', isPrimary: true, isNullable: false, sqlDataType: 'int'});
  colDec(UserXProduct.prototype, 'productID');

  relDec = ManyToOne<UserXProduct, User>(() => User, (uxp, u) => [uxp.userID, u.id]);
  relDec(UserXProduct.prototype, 'user');

  relDec = ManyToOne<UserXProduct, Product>(() => Product, (uxp, p) => [uxp.productID, p.id])
  relDec(UserXProduct.prototype, 'product');

  tblDec = Table({name: 'users_x_products'});
  tblDec(UserXProduct);

  // Vehicle.
  colDec = Column({isPrimary: true, isNullable: false, maxLength: 255, sqlDataType: 'varchar'});
  colDec(Vehicle.prototype, 'make');

  colDec = Column({isPrimary: true, isNullable: false, maxLength: 255, sqlDataType: 'varchar'});
  colDec(Vehicle.prototype, 'model');

  relDec = OneToMany<Vehicle, VehiclePackage>(() => VehiclePackage, (v, vp) => [
    [v.make, vp.make],
    [v.model, vp.model]
  ]);
  relDec(Vehicle.prototype, 'packages');

  tblDec = Table({name: 'vehicles'});
  tblDec(Vehicle);

  // VehiclePackage.
  colDec = Column({name: 'vehiclePackageID', isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'});
  colDec(VehiclePackage.prototype, 'id');

  colDec = Column({isNullable: false, maxLength: 255, sqlDataType: 'varchar'});
  colDec(VehiclePackage.prototype, 'interior');

  colDec = Column({isNullable: false, sqlDataType: 'tinyint'});
  colDec(VehiclePackage.prototype, 'heatedSeats');

  colDec = Column({isNullable: false, maxLength: 255, sqlDataType: 'varchar'});
  colDec(VehiclePackage.prototype, 'make');

  colDec = Column({isNullable: false, maxLength: 255, sqlDataType: 'varchar'});
  colDec(VehiclePackage.prototype, 'model');

  relDec = ManyToOne<VehiclePackage, Vehicle>(() => Vehicle, (vp, v) => [
    [vp.make, v.make],
    [vp.model, v.model]
  ]);
  relDec(VehiclePackage.prototype, 'vehicle');

  tblDec = Table({name: 'vehicle_packages'});
  tblDec(VehiclePackage);

  // TypeTest.
  colDec = Column({isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'});
  colDec(TypeTest.prototype, 'int');

  colDec = Column({maxLength: 10, sqlDataType: 'varchar'});
  colDec(TypeTest.prototype, 'str');

  colDec = Column({sqlDataType: 'timestamp'});
  colDec(TypeTest.prototype, 'dte');

  colDec = Column({sqlDataType: 'double'});
  colDec(TypeTest.prototype, 'num');

  colDec = Column({sqlDataType: 'tinyint'});
  colDec(TypeTest.prototype, 'bool');

  colDec = Column({maxLength: 50, sqlDataType: 'varchar'});
  colDec(TypeTest.prototype, 'email');
  valDec = Validate(new EmailValidator()); // Custom validation.
  valDec(TypeTest.prototype, 'email');

  tblDec = Table({name: 'type_Test'});
  tblDec(TypeTest);

  // MySQLTable.
  colDec = Column({name: 'TABLE_NAME', isPrimary: true});
  colDec(MySQLTable.prototype, 'name');

  colDec = Column({name: 'TABLE_SCHEMA', isPrimary: true});
  colDec(MySQLTable.prototype, 'schema');

  colDec = Column({name: 'TABLE_TYPE'});
  colDec(MySQLTable.prototype, 'type');

  relDec = OneToMany<MySQLTable, MySQLColumn>(
    () => MySQLColumn,
    (t, c) => [[t.name, c.tableName], [t.schema, c.schema]]);
  relDec(MySQLTable.prototype, 'columns');

  tblDec = Table({name: 'TABLES'});
  tblDec(MySQLTable);

  // MySQLColumn.
  colDec = Column({name: 'COLUMN_NAME', isPrimary: true});
  colDec(MySQLColumn.prototype, 'name');

  colDec = Column({name: 'TABLE_NAME', isPrimary: true});
  colDec(MySQLColumn.prototype, 'tableName');

  colDec = Column({name: 'TABLE_SCHEMA', isPrimary: true});
  colDec(MySQLColumn.prototype, 'schema');

  colDec = Column({name: 'DATA_TYPE'});
  colDec(MySQLColumn.prototype, 'dataType');

  colDec = Column({name: 'COLUMN_TYPE'});
  colDec(MySQLColumn.prototype, 'columnType');

  colDec = Column({name: 'IS_NULLABLE', converter: new YesNoConverter()});
  colDec(MySQLColumn.prototype, 'isNullable');

  colDec = Column({name: 'CHARACTER_MAXIMUM_LENGTH'});
  colDec(MySQLColumn.prototype, 'maxLength');

  colDec = Column({name: 'COLUMN_KEY', converter: new MySQLIsPrimaryConverter()});
  colDec(MySQLColumn.prototype, 'isPrimary');

  colDec = Column({name: 'COLUMN_DEFAULT', converter: new HasDefaultConverter()});
  colDec(MySQLColumn.prototype, 'hasDefault');

  colDec = Column({name: 'EXTRA', converter: new MySQLIsGeneratedConverter()});
  colDec(MySQLColumn.prototype, 'isGenerated');

  relDec = OneToMany<MySQLColumn, MySQLKeyColumnUsage>(
    () => MySQLKeyColumnUsage,
    (c, fk) => [
      [c.tableName, fk.tableName],
      [c.schema, fk.schema],
      [c.name, fk.columnName]
    ]);
  relDec(MySQLColumn.prototype, 'keyColumnUsage');

  tblDec = Table({name: 'COLUMNS'});
  tblDec(MySQLColumn);

  // MySQLKeyColumnUsage.
  colDec = Column({name: 'CONSTRAINT_NAME', isPrimary: true});
  colDec(MySQLKeyColumnUsage.prototype, 'constraintName');

  colDec = Column({name: 'COLUMN_NAME', isPrimary: true});
  colDec(MySQLKeyColumnUsage.prototype, 'columnName');

  colDec = Column({name: 'TABLE_NAME', isPrimary: true});
  colDec(MySQLKeyColumnUsage.prototype, 'tableName');

  colDec = Column({name: 'TABLE_SCHEMA', isPrimary: true});
  colDec(MySQLKeyColumnUsage.prototype, 'schema');

  colDec = Column({name: 'REFERENCED_TABLE_NAME'});
  colDec(MySQLKeyColumnUsage.prototype, 'referencedTableName');

  colDec = Column({name: 'REFERENCED_COLUMN_NAME'});
  colDec(MySQLKeyColumnUsage.prototype, 'referencedColumnName');

  tblDec = Table({name: 'KEY_COLUMN_USAGE'});
  tblDec(MySQLKeyColumnUsage);

  // FormnMigration.
  colDec = Column({isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'});
  colDec(FormnMigration.prototype, 'id');

  colDec = Column({isNullable: false, maxLength: 255});
  colDec(FormnMigration.prototype, 'name');

  colDec = Column({hasDefault: true, isNullable: false});
  colDec(FormnMigration.prototype, 'runOn');

  tblDec = Table({name: 'formn_migrations'});
  tblDec(FormnMigration);
}

