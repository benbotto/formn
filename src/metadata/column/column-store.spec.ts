import { ColumnStore } from './column-store';
import metaFactory from '../metadata-factory';
import { initDB } from '../../test/entity/database';

import { User } from '../../test/entity/user.entity';

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
      expect(cols[1].mapTo).toBe('username');
      expect(cols[2].mapTo).toBe('first');
      expect(cols[3].mapTo).toBe('last');
      expect(cols[4].mapTo).toBe('createdOn');
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

  describe('.getPropertyMap()', () => {
    it('gets a PropertyMap for a table.', () => {
      const pm = colStore.getPropertyMap(User);

      expect(pm.id).toBe('id');
      expect(pm.username).toBe('username');
      expect(pm.first).toBe('first');
      expect(pm.last).toBe('last');
      expect(pm.createdOn).toBe('createdOn');
    });

    it('throws an error if the Entity is not decorated.', () => {
      class Test {};

      try {
        colStore.getPropertyMap(Test);
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Failed to get property map for type "Test."  The type must be decorated with @Table.');
      }
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
});

