import { initDB } from '../test/entity/database';
import metaFactory from '../metadata/metadata-factory';
import { TableStore } from '../metadata/table/table-store';
import { ColumnStore } from '../metadata/column/column-store';
import { RelationshipStore } from '../metadata/relationship/relationship-store';
import { RelationshipMetadata } from '../metadata/relationship/relationship-metadata';

import { Schema } from './schema';
import { DataMapper } from './data-mapper';

import { User } from '../test/entity/user.entity';
import { PhoneNumber } from '../test/entity/phone-number.entity';
import { UserXProduct } from '../test/entity/user-x-product.entity';
import { Product } from '../test/entity/product.entity';
import { Photo } from '../test/entity/photo.entity';

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

  // Helper to convert to an object.  Jasmine's .toEqual match checks
  // constructors, so this converts instances to objects.
  function toPlain(p: any) {
    return JSON.parse(JSON.stringify(p));
  }

  beforeEach(() => {
    initDB();

    tblStore = metaFactory.getTableStore();
    colStore = metaFactory.getColumnStore();
    relStore = metaFactory.getRelationshipStore();

    userSchema = new Schema(
      tblStore.getTable(User),
      colStore.getPrimaryKey(User)[0])
      .addColumn(colStore.getColumnMetadataByName(User, 'firstName'))
      .addColumn(colStore.getColumnMetadataByName(User, 'lastName'));

    pnSchema = new Schema(
      tblStore.getTable(PhoneNumber),
      colStore.getPrimaryKey(PhoneNumber)[0])
      .addColumn(colStore.getColumnMetadataByName(PhoneNumber, 'phoneNumber'));

    userXProdSchema = new Schema(
      tblStore.getTable(UserXProduct),
      colStore.getPrimaryKey(UserXProduct)[0]);

    prodSchema = new Schema(
      tblStore.getTable(Product),
      colStore.getPrimaryKey(Product)[0])
      .addColumn(colStore.getColumnMetadataByName(Product, 'description'));

    photoSchema = new Schema(
      tblStore.getTable(Photo),
      colStore.getPrimaryKey(Photo)[0])
      .addColumn(colStore.getColumnMetadataByName(Photo, 'photoURL'));

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

      expect(users).toEqual([
        // User 1 has three phone numbers and 2 products.
        // Nike has 3 photos, Rebok has 2.
        {
          "id": 1,
          "first": "Joe",
          "last": "Shmo",
          "phoneNumbers": [
            {
              "id": 1,
              "phoneNumber": "530-307-8810"
            },
            {
              "id": 2,
              "phoneNumber": "916-200-1440"
            },
            {
              "id": 3,
              "phoneNumber": "916-293-4667"
            }
          ],
          "userXProducts": [
            {
              "id": 1,
              "product": {
                "id": 1,
                "description": "Nike",
                "photos": [
                  {
                    "id": 3,
                    "photoURL": "https://photos.com/nike.jpg"
                  },
                  {
                    "id": 6,
                    "photoURL": "https://photos.com/MJ.jpg"
                  },
                  {
                    "id": 9,
                    "photoURL": "https://photos.com/hoops.jpg"
                  }
                ]
              }
            },
            {
              "id": 2,
              "product": {
                "id": 3,
                "description": "Rebok",
                "photos": [
                  {
                    "id": 12,
                    "photoURL": "https://photos.com/rebok.jpg"
                  },
                  {
                    "id": 15,
                    "photoURL": "https://photos.com/mma.jpg"
                  }
                ]
              }
            }
          ]
        },
        // User 2 has 1 phone number and 1 product.
        // Crystals has no photos.
        {
          "id": 2,
          "first": "Rand",
          "last": "AlThore",
          "phoneNumbers": [
            {
              "id": 4,
              "phoneNumber": "666-451-4412"
            }
          ],
          "userXProducts": [
            {
              "id": 3,
              "product": {
                "id": 2,
                "description": "Crystals",
                "photos": []
              }
            }
          ]
        },
        // User 3 has no phone numbers and the same products as user 1.
        {
          "id": 3,
          "first": "Holly",
          "last": "Davis",
          "phoneNumbers": [],
          "userXProducts": [
            {
              "id": 4,
              "product": {
                "id": 1,
                "description": "Nike",
                "photos": [
                  {
                    "id": 3,
                    "photoURL": "https://photos.com/nike.jpg"
                  },
                  {
                    "id": 6,
                    "photoURL": "https://photos.com/MJ.jpg"
                  },
                  {
                    "id": 9,
                    "photoURL": "https://photos.com/hoops.jpg"
                  }
                ]
              }
            }
          ]
        },
        {
          "id": 4,
          "first": "Jenny",
          "last": "Mather",
          "phoneNumbers": [],
          "userXProducts": []
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
      console.log(phoneNumbers);

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

    /*
    it('serializes multiple sub-schemata with the same primary key value.', function() {
      // Both phoneNumberID and productID are 1.
      const query = [
        {userID: 1, phoneNumberID: 1, productID: 1}
      ];

      const schema = new Schema('userID')
        .addSchema('phoneNumbers', new Schema('phoneNumberID'))
        .addSchema('products',     new Schema('productID'));

      expect(dm.serialize(query, schema)).toEqual([
        {
          userID: 1,
          phoneNumbers: [{phoneNumberID: 1}],
          products: [{productID: 1}]
        }
      ]);
    });

    it('uses converters when serializing.', function() {
      function idConvert(id) {
        return id + 10;
      }

      function ucConvert(str) {
        return str.toUpperCase();
      }

      const query = [
        {userID: 1, firstName: 'Jack', lastName: 'Black'},
        {userID: 2, firstName: 'Dave', lastName: 'Zander'}
      ];
      const schema = new Schema('userID', 'userID', idConvert)
        .addProperty('firstName', 'first', ucConvert)
        .addProperty('lastName');

      expect(dm.serialize(query, schema)).toEqual([
        {userID: 11, first: 'JACK', lastName: 'Black'},
        {userID: 12, first: 'DAVE', lastName: 'Zander'}
      ]);
    });
    */
  });
});

