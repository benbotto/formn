import { metaFactory, TableStore, ColumnStore, RelationshipStore,
  PropertyMapStore, TableType } from '../../metadata/';

import { MySQLEscaper, ConditionBuilder } from '../';

import { User, PhoneNumber, Photo, UserXProduct, Product, Vehicle,
  VehiclePackage, initDB } from '../../test/';

import { From } from '../';

describe('From()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;

  beforeEach(function() {
    initDB();

    tblStore  = metaFactory.getTableStore();
    colStore  = metaFactory.getColumnStore();
    relStore  = metaFactory.getRelationshipStore();
    propStore = metaFactory.getPropertyMapStore();
    escaper   = new MySQLEscaper();

    // From curry: produce a From instance with just an entity and alias.
    getFrom = (FromEntity: TableType, fromAlias?: string) =>
      new From(colStore, tblStore, relStore, propStore, escaper, FromEntity, fromAlias);
  });

  describe('.constructor()', () => {
    it('defaults the table alias to the table name.', () => {
      const from = getFrom(User);

      expect(from.getBaseTableMeta().alias).toBe('users');
    });

    it('uses the supplied table alias.', () => {
      const from = getFrom(User, 'u');

      expect(from.getBaseTableMeta().alias).toBe('u');
    });
  });

  describe('.join()', () => {
    it('throws an error if the parent property is not in the correct format.', () => {
      const from = getFrom(User);
      expect(() => from.join('INNER JOIN', PhoneNumber, 'pn', 'bad'))
        .toThrowError('Parent property must be in the form <parent-alias>.<property>.');
    });

    it('stores metadata about the join table with a derived condition.', () => {
      const from = getFrom(User, 'u')
        .join('INNER JOIN', PhoneNumber, 'pn', 'u.phoneNumbers');

      const meta = from.getJoinMeta()[0];

      expect(meta.alias).toBe('pn');
      expect(meta.parentAlias).toBe('u');
      expect(meta.joinType).toBe('INNER JOIN');
      expect(meta.cond).toEqual({$eq: {'u.id': 'pn.userID'}});
      expect(meta.condStr).toBe('`u`.`userID` = `pn`.`userID`');
      expect(meta.relationshipMetadata).toBe(relStore.getRelationship(User, PhoneNumber, 'phoneNumbers'));
      expect(meta.tableMetadata).toBe(tblStore.getTable(PhoneNumber));
    });

    it('stores metadata about composite joins.', () => {
      const from = getFrom(Vehicle, 'v')
        .join('INNER JOIN', VehiclePackage, 'vp', 'v.packages');

      const meta = from.getJoinMeta()[0];

      expect(meta.alias).toBe('vp');
      expect(meta.parentAlias).toBe('v');
      expect(meta.joinType).toBe('INNER JOIN');
      expect(meta.cond).toEqual({$and: [{$eq: {'v.make': 'vp.make'}}, {$eq: {'v.model': 'vp.model'}}]});
      expect(meta.condStr).toBe('(`v`.`make` = `vp`.`make` AND `v`.`model` = `vp`.`model`)');
      expect(meta.relationshipMetadata).toBe(relStore.getRelationship(Vehicle, VehiclePackage, 'packages'));
      expect(meta.tableMetadata).toBe(tblStore.getTable(VehiclePackage));
    });

    it('throws an error if the relationship between the two tables contains the wrong number of properties.', () => {
      const rel = relStore.getRelationship(User, PhoneNumber, 'phoneNumbers');

      rel.on = () => ['asdf'];
      expect(() => getFrom(User, 'u')
        .join('INNER JOIN', PhoneNumber, 'pn', 'u.phoneNumbers'))
        .toThrowError('Relationship (on) between "User" and "PhoneNumber" must contain exactly 2 properties.');
    });

    it('lets the join condition be overridden.', () => {
      const cond = {$eq: {'u.id': 'pn.id'}};
      const from = getFrom(User, 'u')
        .join('INNER JOIN', PhoneNumber, 'pn', 'u.phoneNumbers', cond);

      const meta = from.getJoinMeta()[0];
      expect(meta.cond).toBe(cond);
      // Note that the FQ properties are mapped to FQ column names.
      expect(meta.condStr).toBe('`u`.`userID` = `pn`.`phoneNumberID`');
    });

    it('lets the join condition be overridden by a ParameterizedCondition instance.', () => {
      const cb   = new ConditionBuilder();
      const cond = cb.eq('u.id', 'pn.id');
      const from = getFrom(User, 'u')
        .join('INNER JOIN', PhoneNumber, 'pn', 'u.phoneNumbers', cond);

      const meta = from.getJoinMeta()[0];
      expect(meta.cond).toEqual({$eq: {'u.id': 'pn.id'}});
      expect(meta.condStr).toBe('`u`.`userID` = `pn`.`phoneNumberID`');
    });

    it('stores the join parameters if supplied.', () => {
      const cond = {
        $and: [
          {$eq: {'u.id': 'pn.id'}},
          {$eq: {'pn.type': ':mobile'}}
        ]
      };

      const params = {mobile: 'cell'};
      const from = getFrom(User, 'u')
        .join('INNER JOIN', PhoneNumber, 'pn', 'u.phoneNumbers', cond, params);

      const meta = from.getJoinMeta()[0];
      expect(meta.cond).toBe(cond);
      expect(from.getParameterList().getParams().mobile).toBe('cell');
    });
  });

  describe('.innerJoin()', () => {
    it('Joins using an INNER JOIN.', () => {
      const from = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers');

      const meta = from.getJoinMeta()[0];

      expect(meta.joinType).toBe('INNER JOIN');
    });
  });

  describe('.leftOuterJoin()', () => {
    it('Joins using an LEFT OUTER JOIN.', () => {
      const from = getFrom(User, 'u')
        .leftOuterJoin(PhoneNumber, 'pn', 'u.phoneNumbers');

      const meta = from.getJoinMeta()[0];

      expect(meta.joinType).toBe('LEFT OUTER JOIN');
    });
  });

  describe('.where()', () => {
    it('stores the condition, compiled, with the parameters.', () => {
      const cond = {$eq: {'u.id': ':me'}};
      const from = getFrom(User, 'u')
        .where(cond, {me: 42});

      const meta = from.getBaseTableMeta();
      expect(meta.cond).toBe(cond);
      expect(meta.condStr).toBe('`u`.`userID` = :me');
      expect(from.getParameterList().getParams().me).toBe(42);
    });

    it('throws an error if a where condition already exists.', () => {
      const cond = {$eq: {'u.id': ':me'}};
      const from = getFrom(User, 'u')
        .where(cond, {me: 42});

      expect(() => from.where(cond, {me: 42}))
        .toThrowError('where already performed on query.');
    });

    it('accepts a ParameterizedCondition.', () => {
      const cb   = new ConditionBuilder();
      const cond = cb.or(
        cb.eq('u.id', ':me', 42),
        cb.eq('u.id', ':she', 41));

      const from = getFrom(User, 'u')
        .where(cond);

      const meta = from.getBaseTableMeta();
      expect(meta.cond).toEqual({
        $or: [
          {$eq: {'u.id': ':me'}},
          {$eq: {'u.id': ':she'}},
        ]
      });
      expect(meta.condStr).toBe('(`u`.`userID` = :me OR `u`.`userID` = :she)');
      expect(from.getParameterList().getParams().me).toBe(42);
      expect(from.getParameterList().getParams().she).toBe(41);
    });
  });

  describe('.toString()', () => {
    it('returns the single-table query.', () => {
      const from = getFrom(User, 'u');

      expect(from.toString()).toBe('FROM    `users` AS `u`');
    });

    it('returns the query with the joins.', () => {
      const from = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers')
        .leftOuterJoin(UserXProduct, 'uxp', 'u.userXProducts');

      expect(from.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'LEFT OUTER JOIN `users_x_products` AS `uxp` ON `u`.`userID` = `uxp`.`userID`');
    });

    it('returns the query with joins and a where clause.', () => {
      const cond = {
        $and: [
          {$eq: {'u.first': ':me'}},
          {$eq: {'pn.id': ':pid'}}
        ]
      };
      const params = {me: 'ben', pid: 2};

      const from = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers')
        .leftOuterJoin(UserXProduct, 'uxp', 'u.userXProducts')
        .where(cond, params);

      expect(from.toString()).toBe(
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'LEFT OUTER JOIN `users_x_products` AS `uxp` ON `u`.`userID` = `uxp`.`userID`\n' +
        'WHERE   (`u`.`firstName` = :me AND `pn`.`phoneNumberID` = :pid)');
    });
  });
});

