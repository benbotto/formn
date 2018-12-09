import { Connection } from 'mysql2/promise';

import metaFactory from '../../metadata/metadata-factory';

import { initDB } from '../../test/entity/database';

import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { TableStore } from '../../metadata/table/table-store';
import { ColumnStore } from '../../metadata/column/column-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { EntityType } from '../../metadata/table/entity-type';

import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';

import { User } from '../../test/entity/user.entity';
import { MySQLUpdateModel } from './mysql-update-model';

describe('MySQLUpdateModel()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getUpdate: <T>(Entity: EntityType, model: T) => MySQLUpdateModel<T>;

  beforeEach(() => {
    initDB();

    tblStore  = metaFactory.getTableStore();
    colStore  = metaFactory.getColumnStore();
    relStore  = metaFactory.getRelationshipStore();
    propStore = metaFactory.getPropertyMapStore();
    escaper   = new MySQLEscaper();
    con       = jasmine.createSpyObj('con', ['query']);
    executer  = new MySQLExecuter(con);

    // Get a MySQLUpdateModel instance using an entity type and entity.
    getUpdate = <T>(Entity: EntityType, model: T) =>
      new MySQLUpdateModel(colStore, tblStore, relStore, propStore, escaper, executer, Entity, model);
  });

  describe('.toString()', () => {
    it('returns an empty string if there are not properties to update.', () => {
      const user = new User();
      user.id = 42;

      const upd = getUpdate(User, user);

      expect(upd.toString()).toBe('');
    });

    it('throws an error if the primary key is not set.', () => {
      const user = new User();

      expect(() => getUpdate(User, user))
        .toThrowError('The primary key is required when mutating a model, but "id" is missing.');
    });

    it('returns the correct update statement for a model', () => {
      const user = new User();
      user.id = 42;
      user.first = 'Ben';
      user.last = 'Botto';

      const upd = getUpdate(User, user);

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `users`\n' +
        'SET\n' +
        '`users`.`firstName` = :users_first_0,\n' +
        '`users`.`lastName` = :users_last_1\n' +
        'WHERE   (`users`.`userID` = :users_id_0)');
    });
  });

  describe('.execute()', () => {
    let updateSpy: jasmine.Spy;

    beforeEach(() => {
      updateSpy = spyOn(executer, 'update');
      updateSpy.and.returnValue(Promise.resolve({affectedRows: 1}));
    });

    it('resolves with the model if there are no rows to update.', (done) => {
      const user = new User();
      user.id = 42;

      getUpdate(User, user)
        .execute()
        .then(u => {
          expect(u).toBe(user);
          done();
        });

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('uses the Executer.update method to execute the query.', (done) => {
      const user = new User();
      user.id = 42;
      user.first = 'Ben';
      user.last = 'Botto';

      const upd = getUpdate(User, user);

      upd
        .execute()
        .then(u => {
          expect(u).toBe(user);
          done();
        });

      expect(updateSpy.calls.argsFor(0)[0]).toBe(upd.toString());
      expect(updateSpy.calls.argsFor(0)[1]).toEqual(
        {users_id_0: 42, users_first_0: 'Ben', users_last_1: 'Botto'});
    });

    it('rejects with an error if no rows are affected.', (done) => {
      updateSpy.and.returnValue(Promise.resolve({affectedRows: 0}));

      const user = new User();
      user.id = 42;
      user.first = 'Ben';
      user.last = 'Botto';

      getUpdate(User, user)
        .execute()
        .catch(err => {
          expect(err.message).toBe('Update operation did not affect any rows.');
          done();
        });
    });
  });
});

