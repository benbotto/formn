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

describe('DataMapper()', function() {
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let relStore: RelationshipStore;
  let userSchema: Schema;
  let pnSchema: Schema;
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
      const rel = relStore.getRelationships(User, PhoneNumber, true, 'phoneNumbers')[0];

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
      const query = [
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 1,    phoneNumber: '916-293-4667', productID: 1,    description: 'Nike',     catDesc: 'Apparel'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 2,    phoneNumber: '916-200-1440', productID: 1,    description: 'Nike',     catDesc: 'Apparel'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 3,    phoneNumber: '530-307-8810', productID: 1,    description: 'Nike',     catDesc: 'Apparel'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 1,    phoneNumber: '916-293-4667', productID: 1,    description: 'Nike',     catDesc: 'Shoes'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 2,    phoneNumber: '916-200-1440', productID: 1,    description: 'Nike',     catDesc: 'Shoes'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 3,    phoneNumber: '530-307-8810', productID: 1,    description: 'Nike',     catDesc: 'Shoes'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 1,    phoneNumber: '916-293-4667', productID: 2,    description: 'Reboc',    catDesc: 'Apparel'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 2,    phoneNumber: '916-200-1440', productID: 2,    description: 'Reboc',    catDesc: 'Apparel'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 3,    phoneNumber: '530-307-8810', productID: 2,    description: 'Reboc',    catDesc: 'Apparel'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 1,    phoneNumber: '916-293-4667', productID: 2,    description: 'Reboc',    catDesc: 'Shoes'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 2,    phoneNumber: '916-200-1440', productID: 2,    description: 'Reboc',    catDesc: 'Shoes'},
        {userID: 1, firstName: 'Joe',  lastName: 'Shmo',    phoneNumberID: 3,    phoneNumber: '530-307-8810', productID: 2,    description: 'Reboc',    catDesc: 'Shoes'},
        {userID: 3, firstName: 'Rand', lastName: 'AlThore', phoneNumberID: 4,    phoneNumber: '666-451-4412', productID: null, description: null,       catDesc: null},
        {userID: 2, firstName: 'Jack', lastName: 'Davis',   phoneNumberID: null, phoneNumber: null,           productID: 3,    description: 'Crystals', catDesc: 'Gifts'},
        {userID: 2, firstName: 'Jack', lastName: 'Davis',   phoneNumberID: null, phoneNumber: null,           productID: 1,    description: 'Nike',     catDesc: 'Shoes'}
      ];

      const schema = new Schema('userID', 'userID')
        .addProperties('firstName', 'lastName')
        .addSchema('phoneNumbers', new Schema('phoneNumber'))
        .addSchema('products', new Schema('prodDesc')
          .addProperty('productVisible', 'isVisible')
          .addSchema('categories', new Schema('catDesc')));

      expect(dm.serialize(query, schema)).toEqual([
        {
          userID: 1,
          firstName: 'Joe',
          lastName: 'Shmo',
          phoneNumbers: [
            {phoneNumber: '916-293-4667'},
            {phoneNumber: '916-200-1440'},
            {phoneNumber: '530-307-8810'}
          ],
          products: [
            {
              prodDesc: 'Nike',
              isVisible: true,
              categories: [
                {catDesc: 'Apparel'},
                {catDesc: 'Shoes'}
              ]
            },
            {
              prodDesc: 'Reboc',
              isVisible: false,
              categories: [
                {catDesc: 'Apparel'},
                {catDesc: 'Shoes'}
              ]
            },
          ]
        },
        {
          userID: 3,
          firstName: 'Rand',
          lastName: 'AlThore',
          phoneNumbers: [{phoneNumber: '666-451-4412'}],
          products: []
        },
        {
          userID: 2,
          firstName: 'Jack',
          lastName: 'Davis',
          phoneNumbers: [],
          products: [
            {
              prodDesc: 'Crystals',
              isVisible: true,
              categories: [
                {catDesc: 'Gifts'}
              ]
            },
            {
              prodDesc: 'Nike',
              isVisible: true,
              categories: [
                {catDesc: 'Shoes'}
              ]
            },
          ]
        }
      ]);
    });

    /*
    it('serializes many-to-one relationships.', function() {
      const query = [
        {userID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 1, phoneNumber: '999-888-7777'},
        {userID: 1, firstName: 'Jack', lastName: 'Black',  phoneNumberID: 2, phoneNumber: '666-555-4444'},
        {userID: 2, firstName: 'Will', lastName: 'Smith',  phoneNumberID: 3, phoneNumber: '333-222-1111'}
      ];
      const schema = new Schema('phoneNumberID')
        .addProperty('phoneNumber')
        .addSchema('person', new Schema('userID')
          .addProperties('firstName', 'lastName'),
        Schema.RELATIONSHIP_TYPE.SINGLE);

      expect(dm.serialize(query, schema)).toEqual([
        {
          phoneNumberID: 1,
          phoneNumber: '999-888-7777',
          person: {
            userID: 1,
            firstName: 'Jack',
            lastName: 'Black'
          }
        },
        {
          phoneNumberID: 2,
          phoneNumber: '666-555-4444',
          person: {
            userID: 1,
            firstName: 'Jack',
            lastName: 'Black'
          }
        },
        {
          phoneNumberID: 3,
          phoneNumber: '333-222-1111',
          person: {
            userID: 2,
            firstName: 'Will',
            lastName: 'Smith'
          }
        }
      ]);
    });

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

