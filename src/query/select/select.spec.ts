import { Connection } from 'mysql2/promise';

import metaFactory from '../../metadata/metadata-factory';

import { initDB } from '../../test/entity/database';

import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { TableStore } from '../../metadata/table/table-store';
import { ColumnStore } from '../../metadata/column/column-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';
import { TableType } from '../../metadata/table/table-type';

import { From } from '../from/from';
import { Select } from './select';

import { User } from '../../test/entity/user.entity';
import { PhoneNumber } from '../../test/entity/phone-number.entity';
import { UserXProduct } from '../../test/entity/user-x-product.entity';
import { Product } from '../../test/entity/product.entity';
import { Photo } from '../../test/entity/photo.entity';
import { toPlain } from '../../test/util/to-plain';

describe('Select()', function() {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;
  let getSelect: <T>(from: From) => Select<T>;

  beforeEach(function() {
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
      new Select<T>(colStore, tblStore, relStore, propStore, escaper, executer, from);
  });

  describe('.constructor()', function() {
    it('can be initialized using a From instance.', function() {
      expect(() => getSelect<User>(getFrom(User, 'u')))
        .not.toThrow();
    });
  });

  describe('.select()', function() {
    it('throws an error if no columns are selected.', () => {
      const query = getSelect<User>(getFrom(User, 'u'));

      expect(() => query.toString())
        .toThrowError('No columns selected.  Call select().');
    });

    it('does not require any arguments.', function() {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select();

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'          + 
        '        `u`.`firstName` AS `u.first`,\n'    + 
        '        `u`.`lastName` AS `u.last`,\n'      + 
        '        `u`.`createdOn` AS `u.createdOn`\n' + 
        'FROM    `users` AS `u`');
    });

    it('cannot be called twice on the same query.', function() {
      expect(function() {
        getSelect<User>(getFrom(User, 'users'))
          .select('users.id', 'users.first', 'users.last')
          .select('users.id', 'users.first', 'users.last');
      }).toThrowError('select already performed on query.');
    });

    it('throws an error if one of the selected columns is invalid.', function() {
      expect(function() {
        getSelect<User>(getFrom(User, 'users')).select('id'); // Should be users.id.
      }).toThrowError('Column "id" is not available.  ' +
        'Columns must be fully-qualified (<table-alias>.<property>).');
    });

    it('throws an error if the primary key of a table is not selected.', function() {
      expect(function() {
        getSelect<User>(getFrom(User, 'users')).select('users.first');
      }).toThrowError(
        'The primary key of every table must be selected, but the ' +
        'primary key of table "users" (alias "users") was not selected.');
    });

    it('throws an error if the primary key of a joined table is not selected.', function() {
      expect(function() {
        const from = getFrom(User, 'u')
          .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers');

        getSelect<User>(from)
          .select('u.id', 'u.first', 'pn.phoneNumber');
      }).toThrowError(
        'The primary key of every table must be selected, but the ' +
        'primary key of table "phone_numbers" (alias "pn") was not selected.');
    });

    it('throws an error if the same column is selected twice.', function() {
      expect(function() {
        getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.first')
      }).toThrowError('Column "u.first" already selected.');
    });
  });

  describe('.orderBy()', function() {
    it('cannot be called twice on the same query.', function() {
      expect(function() {
        getSelect<User>(getFrom(User, 'u'))
          .select('u.id', 'u.first', 'u.last')
          .orderBy('u.first')
          .orderBy('u.first');
      }).toThrowError('orderBy already performed on query.');
    });

    it('throws an error if the orderBy column is not available.', function() {
      expect(function() {
        getSelect<User>(getFrom(User, 'u'))
          .select('u.id', 'u.first', 'u.last')
          .orderBy('bad.column');
      }).toThrowError('"bad.column" is not available for orderBy.');
    });

    it('adds the ORDER BY clause for a single column.', function() {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.last')
        .orderBy('u.first');

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`\n'    +
        'FROM    `users` AS `u`\n' +
        'ORDER BY `u`.`firstName` ASC');
    });

    it('adds the ORDER BY clause for multiple columns.', function() {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.last')
        .orderBy('u.id', 'u.first', 'u.last');

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`\n'    +
        'FROM    `users` AS `u`\n' +
        'ORDER BY `u`.`userID` ASC, `u`.`firstName` ASC, `u`.`lastName` ASC');
    });

    it('can have multiple directions, ASC and DESC.', function() {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.last')
        .orderBy(
          {fqProperty: 'u.id', dir: 'ASC'},
          {fqProperty: 'u.first', dir: 'ASC'},
          {fqProperty: 'u.last', dir: 'DESC'});

      expect(query.toString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`\n'    +
        'FROM    `users` AS `u`\n' +
        'ORDER BY `u`.`userID` ASC, `u`.`firstName` ASC, `u`.`lastName` DESC');
    });
  });

  describe('.execute()', function() {
    let selectSpy: jasmine.Spy;

    beforeEach(() => selectSpy = spyOn(executer, 'select'));

    it('executes the query using the Executer\'s select() method.', function() {
      selectSpy.and.returnValue(Promise.resolve([{}]));

      const query = getSelect<User>(getFrom(User, 'u'))
        .select()
        .execute();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('passes the parameters to the Executer\'s select() method.', function() {
      selectSpy.and.returnValue(Promise.resolve([{}]));

      const params = {userID: 12, firstName: 'Joe'};
      const from = getFrom(User, 'u')
        .where({
          $and: [
            {$eq: {'u.id': ':userID'}},
            {$eq: {'u.first': ':firstName'}}
          ]
        }, params);

      const query = getSelect<User>(from)
        .select();

      query
        .execute();

      expect(selectSpy.calls.argsFor(0)[0]).toEqual(query.toString());
      expect(selectSpy.calls.argsFor(0)[1]).toEqual(params);
    });

    describe('data mapping -', function() {
      it('serializes a single table.', (done) => {
        const usersRaw = require('../../test/query/users.json');

        selectSpy.and.returnValue(Promise.resolve(usersRaw));

        getSelect<User>(getFrom(User, 'u'))
          .select()
          .execute()
          .then(users => {
            expect(users.length).toBe(4);
            users
              .forEach(u => expect(u instanceof User).toBe(true));

            ['Joe', 'Rand', 'Holly', 'Jenny']
              .forEach((first, i) => expect(users[i].first).toBe(first));
            done();
          });
      });

      it('maps the results to a normalized object using a DataMapper instance.', function(done) {
        const usersRaw = require('../../test/query/users-with-phone-numbers-products-and-photos.aliased.json');

        selectSpy.and.returnValue(Promise.resolve(usersRaw));

        const from = getFrom(User, 'u')
          .leftOuterJoin(PhoneNumber, 'pn', 'u.phoneNumbers')
          .leftOuterJoin(UserXProduct, 'uxp', 'u.userXProducts')
          .leftOuterJoin(Product, 'p', 'uxp.product')
          .leftOuterJoin(Photo, 'ph', 'p.photos',
            {
              $and: [
                {$eq: {'p.id' : 'ph.prodID'}},
                {$isnt: {'ph.largeThumbnailID': null}},
                {$isnt: {'ph.smallThumbnailID': null}},
              ]
            });

        const query = getSelect<User>(from)
          .orderBy('u.id', 'pn.id', 'p.id', 'ph.id')
          .select(
            'u.id', 'u.first', 'u.last',
            'pn.id', 'pn.phoneNumber',
            'uxp.id',
            'p.id', 'p.description',
            'ph.id', 'ph.photoURL');

        query
          .execute()
          .then(users => {
            expect(toPlain(users)).toEqual(require('../../test/query/users-with-phone-numbers-products-and-photos.serialized'));
            done();
          });
      });

      it('propagates errors that originate in the Executer.', function(done) {
        selectSpy.and.returnValue(Promise.reject(new Error('test')));
        getSelect<User>(getFrom(User, 'u'))
          .select()
          .execute()
          .catch(err => {
            expect(err.message).toBe('test');
            done();
          });
      });
    });
  });
});

