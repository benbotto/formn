import { initDB } from '../test/entity/database';
import metaFactory from '../metadata/metadata-factory';
import { TableStore } from '../metadata/table/table-store';
import { ColumnStore } from '../metadata/column/column-store';
import { RelationshipStore } from '../metadata/relationship/relationship-store';
import { RelationshipMetadata } from '../metadata/relationship/relationship-metadata';

import { Schema } from './schema';
import { DataMapper } from './data-mapper';

import { Converter } from '../converter/converter';
import { UCConverter } from '../test/converter/uc-converter';

import { User } from '../test/entity/user.entity';
import { PhoneNumber } from '../test/entity/phone-number.entity';
import { UserXProduct } from '../test/entity/user-x-product.entity';
import { Product } from '../test/entity/product.entity';
import { Photo } from '../test/entity/photo.entity';
import { toPlain } from '../test/util/to-plain';

describe('DataMapper()', function() {
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let relStore: RelationshipStore;
  let userSchema: Schema;
  let pnSchema: Schema;
  let userXProdSchema: Schema;
  let prodSchema: Schema;
  let photoSchema: Schema;
  let dm: DataMapper;

  beforeEach(() => {
    initDB();

    tblStore = metaFactory.getTableStore();
    colStore = metaFactory.getColumnStore();
    relStore = metaFactory.getRelationshipStore();

    userSchema = new Schema(
      tblStore.getTable(User),
      colStore.getPrimaryKey(User)[0],
      'userID')
      .addColumn(colStore.getColumnMetadataByName(User, 'firstName'), 'firstName')
      .addColumn(colStore.getColumnMetadataByName(User, 'lastName'), 'lastName');

    pnSchema = new Schema(
      tblStore.getTable(PhoneNumber),
      colStore.getPrimaryKey(PhoneNumber)[0],
      'phoneNumberID')
      .addColumn(colStore.getColumnMetadataByName(PhoneNumber, 'phoneNumber'), 'phoneNumber');

    userXProdSchema = new Schema(
      tblStore.getTable(UserXProduct),
      colStore.getPrimaryKey(UserXProduct)[0],
      'userXProductID');

    prodSchema = new Schema(
      tblStore.getTable(Product),
      colStore.getPrimaryKey(Product)[0],
      'productID')
      .addColumn(colStore.getColumnMetadataByName(Product, 'description'), 'description');

    photoSchema = new Schema(
      tblStore.getTable(Photo),
      colStore.getPrimaryKey(Photo)[0],
      'photoID')
      .addColumn(colStore.getColumnMetadataByName(Photo, 'photoURL'), 'photoURL');

    dm = new DataMapper();
  });

  describe('.serialize()', function() {
    it('serializes a single table.', function() {
      const query = [
        {userID: 1, firstName: 'Jack', lastName: 'Black'},
        {userID: 2, firstName: 'Dave', lastName: 'Zander'}
      ];

      const users: User[] = dm.serialize(query, userSchema);

      expect(toPlain(users)).toEqual([
        {id: 1, first: 'Jack', last: 'Black'},
        {id: 2, first: 'Dave', last: 'Zander'}
      ]);
    });

    it('serializes multiple tables.', function() {
      const query = [
        {userID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 1,    phoneNumber: '999-888-7777'},
        {userID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 2,    phoneNumber: '666-555-4444'},
        {userID: 2, firstName: 'Dave', lastName: 'Zander', phoneNumberID: null, phoneNumber: null}
      ];
      const rel = relStore.getRelationship(User, PhoneNumber, 'phoneNumbers');

      // PhoneNumber is a SubSchema for User.
      userSchema.addSchema(pnSchema, rel);

      const users: User[] = dm.serialize(query, userSchema);

      expect(toPlain(users)).toEqual([
        {
          id: 1,
          first: 'Jack',
          last: 'Black',
          phoneNumbers:  [
            {id: 1, phoneNumber: '999-888-7777'},
            {id: 2, phoneNumber: '666-555-4444'}
          ]
        },
        {
          id: 2,
          first: 'Dave',
          last: 'Zander',
          phoneNumbers: []
        }
      ]);
    });

    it('serializes many-to-one relationships.', function() {
      const query = [
        {userID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 1, phoneNumber: '999-888-7777'},
        {userID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 2, phoneNumber: '666-555-4444'},
        {userID: 2, firstName: 'Will', lastName: 'Smith',  phoneNumberID: 3, phoneNumber: '333-222-1111'}
      ];

      pnSchema
        .addSchema(
          userSchema,
          relStore.getRelationship(PhoneNumber, User, 'user'));

      const phoneNumbers = toPlain(dm.serialize(query, pnSchema));

      expect(phoneNumbers).toEqual([
        {
          id: 1,
          phoneNumber: '999-888-7777',
          user: {
            id: 1,
            first: 'Jack',
            last: 'Black'
          }
        },
        {
          id: 2,
          phoneNumber: '666-555-4444',
          user: {
            id: 1,
            first: 'Jack',
            last: 'Black'
          }
        },
        {
          id: 3,
          phoneNumber: '333-222-1111',
          user: {
            id: 2,
            first: 'Will',
            last: 'Smith'
          }
        }
      ]);
    });

    it('uses converters when serializing.', function() {
      class IDConverter extends Converter {
        onRetrieve(id: number): number {
          return id + 10;
        }
      }

      // Convert firstName to uppercase.
      colStore
        .getColumnMetadataByName(User, 'firstName')
        .converter = new UCConverter();

      // Add 10 to phoneNumberID.
      colStore
        .getColumnMetadataByName(PhoneNumber, 'phoneNumberID')
        .converter = new IDConverter();

      const query = [
        {userID: 1, firstName: 'Jack', lastName: 'Black', phoneNumberID: 3, phoneNumber: '123-456-7890'},
        {userID: 2, firstName: 'Dave', lastName: 'Zander', phoneNumberID: 4, phoneNumber: '987-654-3210'}
      ];

      userSchema
        .addSchema(pnSchema, relStore.getRelationship(User, PhoneNumber, 'phoneNumbers'));

      const users = toPlain(dm.serialize(query, userSchema));

      expect(users).toEqual([
        {
          id: 1,
          first: 'JACK',
          last: 'Black',
          phoneNumbers: [
            {id: 13, phoneNumber: '123-456-7890'}
          ]
        },
        {
          id: 2,
          first: 'DAVE',
          last: 'Zander',
          phoneNumbers: [
            {id: 14, phoneNumber: '987-654-3210'}
          ]
        }
      ]);
    });

    it('uses custom column names.', () => {
      class UCConverter extends Converter {
        onRetrieve(name: string): string {
          return name.toUpperCase();
        }
      }

      // Convert firstName to uppercase.
      colStore
        .getColumnMetadataByName(User, 'firstName')
        .converter = new UCConverter();

      const schema = new Schema(
        tblStore.getTable(User),
        colStore.getPrimaryKey(User)[0],
        'col1')
        .addColumn(colStore.getColumnMetadataByName(User, 'firstName'), 'col2')
        .addColumn(colStore.getColumnMetadataByName(User, 'lastName'), 'col3');

      const query = [
        {col1: 1, col2: 'Jane', col3: 'Doe'},
        {col1: 2, col2: 'Suzy', col3: 'Queue'},
      ];

      const users = toPlain(dm.serialize(query, schema));

      expect(users).toEqual([
        {id: 1, first: 'JANE', last: 'Doe'},
        {id: 2, first: 'SUZY', last: 'Queue'},
      ]);
    });

    it('serializes complex queries recursively.', function() {
      const query = require('../test/query/users-with-phone-numbers-products-and-photos.json');

      userSchema
        .addSchema(
          pnSchema,
          relStore.getRelationship(User, PhoneNumber, 'phoneNumbers'))
        .addSchema(
          userXProdSchema
            .addSchema(
              prodSchema
                .addSchema(photoSchema, relStore.getRelationship(Product, Photo, 'photos')),
              relStore.getRelationship(UserXProduct, Product, 'product')),
          relStore.getRelationship(User, UserXProduct, 'userXProducts'));

      const users = toPlain(dm.serialize(query, userSchema));

      expect(users).toEqual(require('../test/query/users-with-phone-numbers-products-and-photos.serialized'));
    });

    it('serializes sub-documents to null if the PK is not present.', () => {
      const query: object[] = [
        {userID: null, firstName: null, lastName: null, phoneNumberID: 4, phoneNumber: '987-654-3210'}
      ];

      pnSchema
        .addSchema(userSchema, relStore.getRelationship(PhoneNumber, User, 'user'));

      const phoneNumbers = toPlain(dm.serialize(query, pnSchema));

      expect(phoneNumbers).toEqual([
        {
          id: 4,
          phoneNumber: '987-654-3210',
          user:  null
        }
      ]);
    });
  });
});

