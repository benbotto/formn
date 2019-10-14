import { Connection } from 'mysql2/promise';

import { metaFactory, RelationshipStore, TableStore, ColumnStore,
  PropertyMapStore, TableType } from '../../metadata/';

import { initDB, User, PhoneNumber, UserXProduct, Product, Photo, toPlain }
  from '../../test/';

import { MySQLEscaper, MySQLExecuter, From, OrderBy } from '../';

describe('Select()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;
  let getOrder: (from: From) => OrderBy;

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

    getOrder = (from: From) => new OrderBy(escaper, from);
  });

  describe('.orderBy()', () => {
    it('cannot be called twice on the same query.', () => {
      expect(() => {
        getOrder(getFrom(User, 'u'))
          .orderBy('u.first')
          .orderBy('u.first');
      }).toThrowError('orderBy already performed on query.');
    });

    it('throws an error if the orderBy column is not available.', () => {
      expect(() => {
        getOrder(getFrom(User, 'u'))
          .orderBy('bad.column');
      }).toThrowError('"bad.column" is not available for orderBy.');
    });

    it('adds the ORDER BY clause for a single column.', () => {
      const query = getOrder(getFrom(User, 'u'))
        .orderBy('u.first');

      expect(query.getOrderByString()).toBe('ORDER BY `u`.`firstName` ASC');
    });

    it('adds the ORDER BY clause for multiple columns.', () => {
      const query = getOrder(getFrom(User, 'u'))
        .orderBy('u.id', 'u.first', 'u.last');

      expect(query.getOrderByString()).toBe(
        'ORDER BY `u`.`userID` ASC, `u`.`firstName` ASC, `u`.`lastName` ASC');
    });

    it('can have multiple directions, ASC and DESC.', () => {
      const query = getOrder(getFrom(User, 'u'))
        .orderBy(
          {property: 'u.id', dir: 'ASC'},
          {property: 'u.first', dir: 'ASC'},
          {property: 'u.last', dir: 'DESC'});

      expect(query.getOrderByString()).toBe(
        'ORDER BY `u`.`userID` ASC, `u`.`firstName` ASC, `u`.`lastName` DESC');
    });
  });
});

