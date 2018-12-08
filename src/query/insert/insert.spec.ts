import { Connection } from 'mysql2/promise';

import metaFactory from '../../metadata/metadata-factory';

import { initDB } from '../../test/entity/database';

import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { TableStore } from '../../metadata/table/table-store';
import { ColumnStore } from '../../metadata/column/column-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';
import { EntityType } from '../../metadata/table/entity-type';

import { Insert } from './insert';
import { Query } from '../query';
import { ParameterType } from '../condition/parameter-type';

import { Converter } from '../../converter/converter';

import { User } from '../../test/entity/user.entity';

describe('Insert()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getInsert: <T>(Entity: EntityType, model: T) => Insert<T>;

  beforeEach(() => {
    initDB();

    tblStore  = metaFactory.getTableStore();
    colStore  = metaFactory.getColumnStore();
    relStore  = metaFactory.getRelationshipStore();
    propStore = metaFactory.getPropertyMapStore();
    escaper   = new MySQLEscaper();
    con       = jasmine.createSpyObj('con', ['query']);
    executer  = new MySQLExecuter(con);

    // Insert curry to produce an Insert instance with just an entity and model.
    getInsert = <T>(Entity: EntityType, model: T) =>
      new Insert<T>(colStore, tblStore, relStore, propStore, escaper, executer, Entity, model);
  });

  describe('.constructor()', () => {
    it('extends Query.', () => {
      const ins = getInsert(User, new User());
      expect(ins instanceof Query).toBe(true);
    });
  });

  describe('.toString()', () => {
    it('returns the SQL string for a model insert.', () => {
      const user = new User();

      user.first = 'Ben';
      user.last  = 'Botto';

      const insert = getInsert(User, user);

      expect(insert.toString()).toBe(
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        'VALUES (:first, :last)');
    });

    it('returns an empty string if there is nothing to insert.', () => {
      const user = new User();

      const insert = getInsert(User, user);

      expect(insert.toString()).toBe('');
    });
  });

  describe('.execute()', () => {
    let insertSpy: jasmine.Spy;
    let insertId: number;
    let user: User;

    beforeEach(() => {
      insertSpy = spyOn(executer, 'insert');

      insertId = 0;

      // When the Executer.insert method is called return
      // immediately with an insertId.  The insertId starts at
      // 1 and is incremented on each query.
      insertSpy.and.callFake((query: string, params: ParameterType) => 
        Promise.resolve({insertId: ++insertId}));

      // User for testing.
      user = new User();

      user.first = 'Ben';
      user.last  = 'Botto';
    });

    it('does not execute the query if there is nothing to insert.', (done) => {
      const user = new User();

      const insert = getInsert(User, user)
        .execute()
        .then(model => {
          expect(model).toBe(user);
          done();
        });

      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('uses the Executer.insert() method to insert models.', (done) => {
      getInsert(User, user)
        .execute()
        .then(model => {
          expect(model).toBe(user);
          expect(user.id).toBe(1);
          done();
        });

      expect(insertSpy).toHaveBeenCalled();
      expect(insertSpy.calls.argsFor(0)[0]).toBe(
        'INSERT INTO `users` (`firstName`, `lastName`)\n' +
        'VALUES (:first, :last)');
      expect(insertSpy.calls.argsFor(0)[1]).toEqual({first: 'Ben', last: 'Botto'});
    });

    it('does not modify the model if no insertId is returned.', (done) => {
      insertSpy.and.returnValue(Promise.resolve({}));

      getInsert(User, user)
        .execute()
        .then(model => {
          expect(model).toBe(user);
          expect(user.id).not.toBeDefined();
          done();
        });

      expect(insertSpy).toHaveBeenCalled();
    });

    it('propagates errors from the Executer.insert() method.', (done) => {
      const err = new Error();

      insertSpy.and.returnValue(Promise.reject(err));

      getInsert(User, user)
        .execute()
        .catch(e => {
          expect(e).toBe(err);
          done();
        });

      expect(insertSpy).toHaveBeenCalled();
    });

    it('uses the converters defined on the model, if any.', (done) => {
      class UCConverter extends Converter {
        onSave(val: string): string {
          return val.toUpperCase();
        }
      }

      // Convert first name to uppercase.
      colStore
        .getColumnMetadataByMapping(User, 'first')
        .converter = new UCConverter();

      getInsert(User, user)
        .execute()
        .then(model => {
          expect(model).toBe(user);
          expect(user.id).toBe(1);
          done();
        });

      expect(insertSpy).toHaveBeenCalled();
      expect(insertSpy.calls.argsFor(0)[1]).toEqual({first: 'BEN', last: 'Botto'});
    });
  });
});

