import { initDB, User } from '../../test/';

import { TableStore, metaFactory } from '../';

describe('TableStore()', () => {
  let tblStore: TableStore;

  beforeAll(() => {
    initDB();
    tblStore = metaFactory.getTableStore();
  });

  describe('.getTable()', () => {
    it('gets the table by type.', () => {
      const tbl = tblStore.getTable(User);

      expect(tbl.name).toBe('users');
      expect(tbl.Entity).toBe(User);
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

