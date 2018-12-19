import { initDB, User, PhoneNumber, UserXProduct } from '../test/';

import { metaFactory, TableStore, ColumnStore, RelationshipStore,
  RelationshipMetadata } from '../metadata/';

import { Schema } from './';

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
      colStore.getPrimaryKey(User),
      ['userID']);
  });

  describe('.constructor()', function() {
    it('stores the key column and table.', function() {
      const cols = userSchema.columns;

      expect(cols.length).toBe(1);
      expect(cols[0]).toBe(userSchema.getKeyColumns()[0]);
      expect(cols[0].meta.mapTo).toBe('id');
      expect(cols[0].name).toBe('userID');
      expect(cols[0].meta.name).toBe('userID');
      expect(userSchema.table.name).toBe('users');
      expect(userSchema.table.Entity).toBe(User);
    });

    it('stores composite key columns.', () => {
      const schema = new Schema(
        tblStore.getTable(UserXProduct),
        colStore.getPrimaryKey(UserXProduct),
        ['userID', 'productID']);

      const cols = schema.columns;

      expect(cols.length).toBe(2);
      expect(cols[0]).toBe(schema.getKeyColumns()[0]);
      expect(cols[1]).toBe(schema.getKeyColumns()[1]);
      expect(cols[0].name).toBe('userID');
      expect(cols[1].name).toBe('productID');
      expect(schema.table.name).toBe('users_x_products');
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
        colStore.getPrimaryKey(PhoneNumber),
        ['phoneNumberID']);
      
      rel = relStore.getRelationships(User, PhoneNumber, true, 'phoneNumbers')[0];
    });

    it('stores a SubSchema instance with the relationship and schema.', function() {
      userSchema.addSchema(pnSchema, rel);

      const schemata = userSchema.schemata;

      expect(schemata.length).toBe(1);
      expect(schemata[0].relationship.mapTo).toBe('phoneNumbers');
      expect(schemata[0].relationship.cardinality).toBe('OneToMany');
      expect(schemata[0].schema.getKeyColumns()[0].name).toBe('phoneNumberID');
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

