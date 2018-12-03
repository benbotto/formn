import { initDB } from '../test/entity/database';
import metaFactory from '../metadata/metadata-factory';
import { TableStore } from '../metadata/table/table-store';
import { ColumnStore } from '../metadata/column/column-store';
import { RelationshipStore } from '../metadata/relationship/relationship-store';
import { RelationshipMetadata } from '../metadata/relationship/relationship-metadata';

import { Schema } from './schema';
import { User } from '../test/entity/user.entity';
import { PhoneNumber } from '../test/entity/phone-number.entity';

describe('Schema()', function() {
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let relStore: RelationshipStore;
  let userSchema: Schema;

  beforeEach(() => {
    initDB();

    tblStore = metaFactory.getTableStore();
    colStore = metaFactory.getColumnStore();
    relStore = metaFactory.getRelationshipStore();

    userSchema = new Schema(
      tblStore.getTable(User),
      colStore.getPrimaryKey(User)[0],
      'userID');
  });

  describe('.constructor()', function() {
    it('stores the key column and table.', function() {
      const cols = userSchema.columns;

      expect(cols.length).toBe(1);
      expect(cols[0]).toBe(userSchema.getKeyColumn());
      expect(cols[0].meta.mapTo).toBe('id');
      expect(cols[0].name).toBe('userID');
      expect(cols[0].meta.name).toBe('userID');
      expect(userSchema.table.name).toBe('users');
      expect(userSchema.table.Entity).toBe(User);
    });
  });

  describe('.addColumn()', function() {
    it('throw if the property name has been used.', function() {
      expect(() => userSchema.addColumn(colStore.getPrimaryKey(User)[0], 'userID'))
        .toThrowError('Property "id" already present in schema.');
    });

    it('stores the column.', () => {
      userSchema.addColumn(colStore.getColumnMetadataByName(User, 'firstName'), 'colName');

      const cols = userSchema.columns;

      expect(cols.length).toBe(2);
      expect(cols[1].name).toBe('colName');
      expect(cols[1].meta.mapTo).toBe('first');
      expect(cols[1].meta.name).toBe('firstName');
    });
  });

  describe('.addSchema()', function() {
    let pnSchema: Schema;
    let rel: RelationshipMetadata;

    beforeEach(() => {
      pnSchema = new Schema(
        tblStore.getTable(PhoneNumber),
        colStore.getPrimaryKey(PhoneNumber)[0],
        'phoneNumberID');
      
      rel = relStore.getRelationships(User, PhoneNumber, true, 'phoneNumbers')[0];
    });

    it('stores a SubSchema instance with the relationship and schema.', function() {
      userSchema.addSchema(pnSchema, rel);

      const schemata = userSchema.schemata;

      expect(schemata.length).toBe(1);
      expect(schemata[0].relationship.mapTo).toBe('phoneNumbers');
      expect(schemata[0].relationship.cardinality).toBe('OneToMany');
      expect(schemata[0].schema.getKeyColumn().name).toBe('phoneNumberID');
      expect(schemata[0].schema.table.Entity).toBe(PhoneNumber);
    });

    it('throws an error if the property name of the sub schema is already not unique.', function() {
      userSchema.addSchema(pnSchema, rel);

      expect(() => userSchema.addSchema(pnSchema, rel))
        .toThrowError('Property "phoneNumbers" already present in schema.');
    });

    it('throws an error if the schema is not related.', () => {
      // This relationship is from PhoneNumber to User, and only relationships
      // from User to PhoneNumber are valid.
      const badRel = relStore.getRelationships(PhoneNumber, User, true, 'user')[0];

      expect(() => userSchema.addSchema(pnSchema, badRel))
        .toThrowError('Schema relationship Entity must be "User" but "PhoneNumber" provided.')
    });
  });
});

