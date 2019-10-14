import { Connection } from 'mysql2/promise';

import { metaFactory, RelationshipStore, TableStore, ColumnStore,
  PropertyMapStore, TableType } from '../../metadata/';

import { initDB, User, PhoneNumber, UserXProduct, Product, Photo, toPlain }
  from '../../test/';

import { MySQLEscaper, MySQLExecuter, From, MySQLSelect } from '../';

describe('MySQLSelect()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;
  let getSelect: <T>(from: From) => MySQLSelect<T>;

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

    getSelect = <T>(from: From) =>
      new MySQLSelect<T>(colStore, tblStore, relStore, propStore, escaper, executer, from);
  });

  describe('.toString()', () => {
    it('returns the select and from portion without an order.', () => {
      const query = getSelect<User>(getFrom(User, 'u')
          .leftOuterJoin(PhoneNumber, 'pn', 'u.phoneNumbers'))
        .select('u.id', 'u.first', 'u.last', 'pn.id');

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'         +
        '        `u`.`firstName` AS `u.first`,\n'   +
        '        `u`.`lastName` AS `u.last`,\n'     +
        '        `pn`.`phoneNumberID` AS `pn.id`\n' +
        'FROM    `users` AS `u`\n' +
        'LEFT OUTER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`');
    });

    it('returns the select string with an order by.', () => {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.last')
        .orderBy(
          {property: 'u.id', dir: 'ASC'},
          {property: 'u.first', dir: 'ASC'},
          {property: 'u.last', dir: 'DESC'});

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`\n'    +
        'FROM    `users` AS `u`\n'                +
        'ORDER BY `u`.`userID` ASC, `u`.`firstName` ASC, `u`.`lastName` DESC');
    });

    it('limits the rows with an implicit offset of 0.', () => {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.last')
        .orderBy('u.id')
        .limit(3);

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`\n'    +
        'FROM    `users` AS `u`\n'                +
        'ORDER BY `u`.`userID` ASC\n'             +
        'LIMIT   0, 3');
    });

    it('limits the rows with an offset.', () => {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.last')
        .orderBy('u.id')
        .limit(10, 3);

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`\n'    +
        'FROM    `users` AS `u`\n'                +
        'ORDER BY `u`.`userID` ASC\n'             +
        'LIMIT   10, 3');
    });
  });
});

