import { Connection } from 'mysql2/promise';

import { metaFactory, RelationshipStore, TableStore, ColumnStore,
  PropertyMapStore, TableType } from '../../metadata/';

import { initDB, User } from '../../test/';

import { MySQLEscaper, MySQLExecuter, From, Count, OrderBy } from '../';

describe('Count()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;
  let getCount: (from: From) => Count;

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

    getCount = (from: From) =>
      new Count(escaper, executer, from, new OrderBy(escaper, from));
  });

  describe('.constructor()', () => {
    it('can be initialized using a From instance.', () => {
      expect(() => getCount(getFrom(User, 'u')))
        .not.toThrow();
    });
  });

  describe('.count()', () => {
    it('counts * by default.', () => {
      const query = getCount(getFrom(User, 'u'));

      query.count();

      expect(query.toString()).toBe(
        'SELECT  COUNT(*) AS count\n' +
        'FROM    `users` AS `u`');
    });

    it('counts a single column.', () => {
      const query = getCount(getFrom(User, 'u'));

      query.count('u.id');

      expect(query.toString()).toBe(
        'SELECT  COUNT(`u`.`userID`) AS count\n' +
        'FROM    `users` AS `u`');
    });

    it('throws if the column is not available for selection.', () => {
      expect(() => {
        const query = getCount(getFrom(User, 'u'));

        query.count('bad');
      }).toThrowError('"bad" is not available for count.');
    });
  });

  describe('.orderBy()', () => {
    it('orders the query by a single column.', () => {
      const query = getCount(getFrom(User, 'u'));

      query
        .count()
        .orderBy('u.id');

      expect(query.toString()).toBe(
        'SELECT  COUNT(*) AS count\n' +
        'FROM    `users` AS `u`\n'      +
        'ORDER BY `u`.`userID` ASC');
    });
  });

  describe('.execute()', () => {
    let selectSpy: jasmine.Spy;

    beforeEach(() => selectSpy = spyOn(executer, 'select'));

    it('executes the query using the Executer\'s select() method.', async () => {
      selectSpy.and.returnValue(Promise.resolve([{'count': 1}]));

      const count = await getCount(getFrom(User, 'u'))
        .count()
        .execute();

      expect(selectSpy).toHaveBeenCalled();
      expect(count).toBe(1);
    });
  });
});

