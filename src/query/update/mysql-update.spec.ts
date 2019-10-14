import { Connection } from 'mysql2/promise';

import { metaFactory, RelationshipStore, TableStore, ColumnStore,
  PropertyMapStore, TableType } from '../../metadata/';

import { initDB, User, PhoneNumber, UCConverter } from '../../test/';

import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';

import { Converter } from '../../converter/';

import { From, Query, MySQLUpdate, UpdateType } from '../';

describe('MySQLUpdate()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;
  let getUpdate: (from: From, model: UpdateType) => MySQLUpdate;

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

    getUpdate = (from: From, model: UpdateType) =>
      new MySQLUpdate(escaper, executer, from, model);
  });

  describe('.constructor()', () => {
    it('extends Query.', () => {
      const upd = getUpdate(
        getFrom(User, 'u'), {'u.first': 'Ben'});

      expect(upd instanceof Query).toBe(true);
    });

    it('throws an error if a model key does not match a fully-qualified property.', () => {
      expect(() => getUpdate(getFrom(User, 'u'), {'foo': 'Ben'}))
        .toThrowError('Column "foo" is not available for updating.');
    });
  });

  describe('.toString()', () => {
    it('returns an empty string if there are not columns to update.', () => {
      const upd = getUpdate(
        getFrom(User, 'u'), {});

      expect(upd.toString()).toBe('');
    });

    it('returns an update statement for one table.', () => {
      const upd = getUpdate(
        getFrom(User, 'u'), {'u.first' : 'Ben', 'u.last' : 'Botto'});

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_first_0,\n' +
        '`u`.`lastName` = :u_last_1');
    });

    it('returns an update statement with a join.', () => {
      const from = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers');
      const upd = getUpdate(from, {'u.first' : 'Ben'});

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_first_0');
    });

    it('returns an update statement with a where clause.', () => {
      const from = getFrom(User, 'u')
        .where({$eq: {'u.id' : ':myID'}}, {myID: 42});
      const upd = getUpdate(from, {'u.first' : 'Ben', 'u.last' : 'Botto'});

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_first_0,\n' +
        '`u`.`lastName` = :u_last_1\n' +
        'WHERE   `u`.`userID` = :myID');
    });

    it('returns an update statement with a join and a where clause.', () => {
      const from = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers')
        .where({$eq: {'u.id' : ':myID'}}, {myID: 42});
      const upd = getUpdate(from, {'u.first' : 'Ben'});

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_first_0\n' +
        'WHERE   `u`.`userID` = :myID');
    });
  });

  describe('.execute()', () => {
    let updateSpy: jasmine.Spy;

    beforeEach(() => {
      updateSpy = spyOn(executer, 'update');
      updateSpy.and.returnValue(Promise.resolve({affectedRows: 1}));
    });

    it('resolves with 0 affectedRows if there are no columns to update.', (done) => {
      const upd = getUpdate(
        getFrom(User, 'u'), {});

      upd
        .execute()
        .then(res => {
          expect(res.affectedRows).toBe(0);
          done();
        });

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('uses the Executer.update() method to execute the SQL.', (done) => {
      const from = getFrom(User, 'u')
        .where({$eq: {'u.id' : ':myID'}}, {myID: 42});
      const upd = getUpdate(from, {'u.first' : 'Ben', 'u.last' : 'Botto'});

      upd
        .execute()
        .then(res => {
          expect(res.affectedRows).toBe(1);
          done();
        });

      expect(updateSpy).toHaveBeenCalled();
      expect(updateSpy.calls.argsFor(0)[0]).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_first_0,\n' +
        '`u`.`lastName` = :u_last_1\n' +
        'WHERE   `u`.`userID` = :myID');

      expect(updateSpy.calls.argsFor(0)[1]).toEqual(
        {myID: 42, u_first_0: 'Ben', u_last_1: 'Botto'});
    });

    it('propagates errors from the queryExecuter.update() method.', (done) => {
      const upd = getUpdate(
        getFrom(User, 'u'), {'u.first': 'Ben'});
      const err = new Error();

      updateSpy.and.returnValue(Promise.reject(err));

      upd
        .execute()
        .catch(e => {
          expect(e).toBe(err);
          done();
        });
    });

    it('uses converts when present.', (done) => {
      colStore
        .getColumnMetadataByMapping(User, 'first')
        .converter = new UCConverter();

      const upd = getUpdate(
        getFrom(User, 'u'), {'u.first': 'Ben', 'u.last': 'Botto'});
      const err = new Error();

      upd
        .execute()
        .then(() => done());

      expect(updateSpy.calls.argsFor(0)[0]).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_first_0,\n' +
        '`u`.`lastName` = :u_last_1');

      expect(updateSpy.calls.argsFor(0)[1]).toEqual(
        {u_first_0: 'BEN', u_last_1: 'Botto'});
    });
  });
});

