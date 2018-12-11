import { Connection } from 'mysql2/promise';

import metaFactory from '../../metadata/metadata-factory';
import { TableStore } from '../../metadata/table/table-store';
import { ColumnStore } from '../../metadata/column/column-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { EntityType } from '../../metadata/table/entity-type';

import { initDB } from '../../test/entity/database';
import { User } from '../../test/entity/user.entity';
import { PhoneNumber } from '../../test/entity/phone-number.entity';

import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';
import { MySQLFromAdapter } from './mysql-from-adapter';
import { Select } from '../select/select';

describe('MySQLFromAdapter()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let con: jasmine.SpyObj<Connection>;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let getFrom: (FromEntity: EntityType, fromAlias?: string) => MySQLFromAdapter;

  beforeEach(function() {
    initDB();

    tblStore  = metaFactory.getTableStore();
    colStore  = metaFactory.getColumnStore();
    relStore  = metaFactory.getRelationshipStore();
    propStore = metaFactory.getPropertyMapStore();
    escaper   = new MySQLEscaper();
    con       = jasmine.createSpyObj('con', ['query']);
    executer  = new MySQLExecuter(con);

    // From curry: produce a FromAdapter instance with just an entity and alias.
    getFrom = (FromEntity: EntityType, fromAlias?: string) =>
      new MySQLFromAdapter(colStore, tblStore, relStore, propStore, escaper, executer, FromEntity, fromAlias);
  });

  describe('.constructor()', () => {
    it('passes the Entity and alias up to the From super class.', () => {
      const from = getFrom(User, 'u');

      expect(from.getBaseTableMeta().alias).toBe('u');
      expect(from.getBaseTableMeta().tableMetadata.Entity).toBe(User);
    });
  });

  describe('.select()', () => {
    it('returns a Select instance with the supplied columns selected.', () => {
      const sel = getFrom(User, 'u')
        .select('u.id', 'u.first');

      expect(sel instanceof Select).toBe(true);
      expect(sel.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'      + 
        '        `u`.`firstName` AS `u.first`\n' + 
        'FROM    `users` AS `u`');
    });

    it('selects all columns if none are supplied.', () => {
      const sel = getFrom(User, 'u')
        .select();

      expect(sel instanceof Select).toBe(true);
      expect(sel.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'          + 
        '        `u`.`firstName` AS `u.first`,\n'    + 
        '        `u`.`lastName` AS `u.last`,\n'      +
        '        `u`.`createdOn` AS `u.createdOn`\n' +
        'FROM    `users` AS `u`');
    });
  });

  describe('.delete()', () => {
    it('returns a Delete instance with the supplied table alias.', () => {
      const del = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers')
        .where({$eq: {'u.id': ':userID'}}, {userID: 42})
        .delete('pn');

      expect(del.toString()).toBe(
        'DELETE  `pn`\n' +
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'WHERE   `u`.`userID` = :userID'
      );
    });

    it('uses the alias of the base table if none is provided.', () => {
      const del = getFrom(User, 'u')
        .where({$eq: {'u.id': ':userID'}}, {userID: 42})
        .delete();

      expect(del.toString()).toBe(
        'DELETE  `u`\n' +
        'FROM    `users` AS `u`\n' +
        'WHERE   `u`.`userID` = :userID'
      );
    });
  });

  describe('.update()', () => {
    it('returns an Update instance with the model set.', () => {
      const upd = getFrom(User, 'u')
        .update({'u.first': 'Ben'});

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_first_0');
    });
  });
});

