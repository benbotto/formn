import { initDB, User, ExtendedUser } from '../../test/';

import { ColumnStore, metaFactory } from '../';

describe('ColumnStore()', () => {
  let colStore: ColumnStore;

  beforeAll(function() {
    // (Re)initialize the db.
    initDB();

    // Reference to the global ColumnStore.
    colStore = metaFactory.getColumnStore();
  });

  describe('.getColumnMetadata()', () => {
    it('gets all the columns for a table.', () => {
      const cols = colStore.getColumnMetadata(User);

      expect(cols[0].mapTo).toBe('id');
      expect(cols[1].mapTo).toBe('first');
      expect(cols[2].mapTo).toBe('last');
      expect(cols[3].mapTo).toBe('createdOn');
    });

    it('gets the columns for the table and the parent table\'s columns.', () => {
      const cols = colStore.getColumnMetadata(ExtendedUser);

      expect(cols[0].mapTo).toBe('fullName');
      expect(cols[1].mapTo).toBe('id');
      expect(cols[2].mapTo).toBe('first');
      expect(cols[3].mapTo).toBe('last');
      expect(cols[4].mapTo).toBe('createdOn');

      for (const col of cols)
        expect(col.Entity).toBe(ExtendedUser);
    });

    it('throws an error if the Entity is not decorated.', () => {
      class Test {};

      try {
        colStore.getColumnMetadata(Test);
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Failed to get column metadata for type "Test."  The type must be decorated with @Table.');
      }
    });
  });

  describe('.getColumnMetadataByName()', () => {
    it('throws an error if the column does not exist.', () => {
      try {
        colStore.getColumnMetadataByName(User, 'foo');
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Column "foo" does not exist in table "User."');
      }
    });

    it('returns the ColumnMetadata.', () => {
      const col = colStore.getColumnMetadataByName(User, 'userID');

      expect(col.mapTo).toBe('id');
    });
  });

  describe('.getColumnMetadataByMapping()', () => {
    it('throws an error if the column does not exist.', () => {
      try {
        colStore.getColumnMetadataByMapping(User, 'foo');
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Column with mapping "foo" does not exist in table "User."');
      }
    });

    it('returns the ColumnMetadata.', () => {
      const col = colStore.getColumnMetadataByMapping(User, 'id');

      expect(col.name).toBe('userID');
    });
  });

  describe('.getPrimaryKey()', () => {
    it('returns the array of primary key ColumnMetadata for a table.', () => {
      const pk = colStore.getPrimaryKey(User);
      expect(pk.length).toBe(1);
      expect(pk[0].name).toBe('userID');
      expect(pk[0].mapTo).toBe('id');
    });
  });

  describe('.hasColumnMetadata()', () => {
    it('returns true if the entity has columns.', () => {
      expect(colStore.hasColumnMetadata(User)).toBe(true);
    });

    it('returns false if the entity has no columns.', () => {
      class Foo {}

      expect(colStore.hasColumnMetadata(Foo)).toBe(false);
    });
  });
});

