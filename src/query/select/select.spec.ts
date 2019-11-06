import { Connection } from 'mysql2/promise';

import { metaFactory, RelationshipStore, TableStore, ColumnStore,
  PropertyMapStore, TableType } from '../../metadata/';

import { initDB, User, PhoneNumber, UserXProduct, Product, Photo, toPlain }
  from '../../test/';

import { MySQLEscaper, MySQLExecuter, From, Select, OrderBy } from '../';

describe('Select()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getFrom: (FromEntity: TableType, fromAlias?: string) => From;
  let getSelect: <T>(from: From) => Select<T>;
  let getSelectDistinct: <T>(from: From) => Select<T>;

  // Select is abstract (toString is driver specific).
  class TestSelect<T> extends Select<T> {
    toString(): string {
      return '';
    }
  }

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
      new TestSelect<T>(colStore, escaper, executer, from,
        new OrderBy(escaper, from));

    getSelectDistinct = <T>(from: From) =>
      new TestSelect<T>(colStore, escaper, executer, from,
        new OrderBy(escaper, from), true);
  });

  describe('.constructor()', () => {
    it('can be initialized using a From instance.', () => {
      expect(() => getSelect<User>(getFrom(User, 'u')))
        .not.toThrow();
    });
  });

  describe('.select()', () => {
    it('throws an error if no columns are selected.', () => {
      const query = getSelect<User>(getFrom(User, 'u'));

      expect(() => query.getSelectString())
        .toThrowError('No columns selected.  Call select().');
    });

    it('does not require any arguments.', () => {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select();

      expect(query.getSelectString()).toBe(
        'SELECT  `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`,\n'   +
        '        `u`.`createdOn` AS `u.createdOn`');
    });

    it('can be made distinct.', () => {
      const query = getSelectDistinct<User>(getFrom(User, 'u'))
        .select('u.id');

      expect(query.getSelectString()).toBe(
        'SELECT  DISTINCT\n' +
        '        `u`.`userID` AS `u.id`');
    });

    it('cannot be called twice on the same query.', () => {
      expect(() => {
        getSelect<User>(getFrom(User, 'users'))
          .select('users.id', 'users.first', 'users.last')
          .select('users.id', 'users.first', 'users.last');
      }).toThrowError('select already performed on query.');
    });

    it('throws an error if one of the selected columns is invalid.', () => {
      expect(() => {
        getSelect<User>(getFrom(User, 'users')).select('id'); // Should be users.id.
      }).toThrowError('Column "id" is not available.  ' +
        'Columns must be fully-qualified (<table-alias>.<property>).');
    });

    it('throws an error if the primary key of a table is not selected.', () => {
      expect(() => {
        getSelect<User>(getFrom(User, 'users')).select('users.first');
      }).toThrowError(
        'The primary key of every table must be selected, but the ' +
        'primary key of table "users" (alias "users") was not selected.');
    });

    it('throws an error if the primary key of a joined table is not selected.', () => {
      expect(() => {
        const from = getFrom(User, 'u')
          .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers');

        getSelect<User>(from)
          .select('u.id', 'u.first', 'pn.phoneNumber');
      }).toThrowError(
        'The primary key of every table must be selected, but the ' +
        'primary key of table "phone_numbers" (alias "pn") was not selected.');
    });

    it('throws an error if the same column is selected twice.', () => {
      expect(() => {
        getSelect<User>(getFrom(User, 'u'))
        .select('u.id', 'u.first', 'u.first')
      }).toThrowError('Column "u.first" already selected.');
    });
  });

  describe('.distinct()', () => {
    it('can be made distinct.', () => {
      const query = getSelect<User>(getFrom(User, 'u'))
        .select()
        .distinct();

      expect(query.getSelectString()).toBe(
        'SELECT  DISTINCT\n'                      +
        '        `u`.`userID` AS `u.id`,\n'       +
        '        `u`.`firstName` AS `u.first`,\n' +
        '        `u`.`lastName` AS `u.last`,\n'   +
        '        `u`.`createdOn` AS `u.createdOn`');
    });
  });

  describe('.execute()', () => {
    let selectSpy: jasmine.Spy;

    beforeEach(() => selectSpy = spyOn(executer, 'select'));

    it('executes the query using the Executer\'s select() method.', () => {
      selectSpy.and.returnValue(Promise.resolve([{}]));

      const query = getSelect<User>(getFrom(User, 'u'))
        .select()
        .execute();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('passes the parameters to the Executer\'s select() method.', () => {
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

    describe('data mapping -', () => {
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
            'uxp.userID', 'uxp.productID',
            'p.id', 'p.description', 'p.isActive',
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

