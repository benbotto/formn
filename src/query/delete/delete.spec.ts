import { Connection } from 'mysql2/promise';

import { metaFactory, RelationshipStore, TableStore, ColumnStore,
  PropertyMapStore, EntityType, TableType } from '../../metadata/';

import { Converter } from '../../converter/';

import { initDB, UCConverter, User, PhoneNumber } from '../../test/';

import { MySQLEscaper, MySQLExecuter, From, Query, Delete } from '../';

describe('Delete()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;
  let getDelete: (from: From, alias?: string) => Delete;

  beforeEach(() => {
    initDB();

    tblStore  = metaFactory.getTableStore();
    colStore  = metaFactory.getColumnStore();
    relStore  = metaFactory.getRelationshipStore();
    propStore = metaFactory.getPropertyMapStore();
    escaper   = new MySQLEscaper();
    con       = jasmine.createSpyObj('con', ['query']);
    executer  = new MySQLExecuter(con);

    // From curry: produce a From instance with just an entity and alias.
    getFrom = (FromEntity: TableType, fromAlias?: string) =>
      new From(colStore, tblStore, relStore, propStore, escaper, FromEntity, fromAlias);

    getDelete = (from: From, alias?: string) =>
      new Delete(escaper, executer, from, alias);
  });

  describe('.constructor()', () => {
    it('extends Query.', () => {
      const del = getDelete(
        getFrom(User, 'u'));

      expect(del instanceof Query).toBe(true);
    });
  });

  describe('.toString()', () => {
    it('uses the alias from the base table if none is provided.', () => {
      const del = getDelete(
        getFrom(User, 'u')
          .where({$eq: {'u.id': ':userID'}}, {userID: 42}));

      expect(del.toString()).toBe(
        'DELETE  `u`\n' +
        'FROM    `users` AS `u`\n' +
        'WHERE   `u`.`userID` = :userID'
      );
    });

    it('uses the provided alias.', () => {
      const from = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers')
        .where({$eq: {'u.id': ':userID'}}, {userID: 42});
      const del = getDelete(from, 'pn');

      expect(del.toString()).toBe(
        'DELETE  `pn`\n' +
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'WHERE   `u`.`userID` = :userID'
      );
    });
  });

  describe('.execute()', () => {
    let deleteSpy: jasmine.Spy;

    beforeEach(() => {
      deleteSpy = spyOn(executer, 'delete');
      deleteSpy.and.returnValue(Promise.resolve({affectedRows: 1}));
    });

    it('executes the query using the Executer.delete method.', (done) => {
      const del = getDelete(
        getFrom(User, 'u')
          .where({$eq: {'u.id': ':userID'}}, {userID: 42}));

      del
        .execute()
        .then(res => {
          expect(res.affectedRows).toBe(1);
          done();
        });

      expect(deleteSpy).toHaveBeenCalled();
      expect(deleteSpy.calls.argsFor(0)[0]).toBe(del.toString());
      expect(deleteSpy.calls.argsFor(0)[1]).toEqual({userID: 42});
    });

    it('propagates errors from the Executer.delete() method.', (done) => {
      const del = getDelete(
        getFrom(User, 'u')
          .where({$eq: {'u.id': ':userID'}}, {userID: 42}));
      const err = new Error();

      deleteSpy.and.returnValue(Promise.reject(err));

      del
        .execute()
        .catch(e => {
          expect(e).toBe(err);
          done();
        });
    });
  });
});

