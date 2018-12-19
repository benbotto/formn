import { initDB, User } from '../../test/';

import { TableStore, metaFactory } from '../';

describe('TableStore()', () => {
  let tblStore: TableStore;

  beforeAll(() => {
    initDB();
    tblStore = metaFactory.getTableStore();
  });

  describe('.getTableMetadata()', () => {
    it('gets all the tables for the database.', () => {
      const tbls = tblStore.getTableMetadata();

      expect(tbls.find(t => t.name === 'users')).toBeDefined();
      expect(tbls.find(t => t.name === 'phone_numbers')).toBeDefined();
      expect(tbls.find(t => t.name === 'products')).toBeDefined();
      expect(tbls.find(t => t.name === 'photos')).toBeDefined();
    });

    it('throws an error if the database does not exist.', () => {
      try {
        tblStore.getTableMetadata('foo');
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Database "foo" does not exist in TableStore.');
      }
    });
  });

  describe('.getTable()', () => {
    it('gets the table by type.', () => {
      const tbl = tblStore.getTable(User);

      expect(tbl.name).toBe('users');
      expect(tbl.Entity).toBe(User);
      expect(tbl.database).toBe('default');
    });

    it('throws an error if the table is not found.', () => {
      class Test {};

      try {
        tblStore.getTable(Test);
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Table "Test" not found in TableStore.  It must be decorated with @Table.');
      }
    });
  });

  describe('.getFQName()', () => {
    it('returns the name of the table.', () => {
      const tbl = tblStore.getTable(User);

      expect(tbl.getFQName()).toBe('users');
    });

    it('returns the name with the schema prefix.', () => {
      const tbl = tblStore.getTable(User);

      tbl.schema = 'dbo';

      expect(tbl.getFQName()).toBe('dbo.users');
    });
  });
});

