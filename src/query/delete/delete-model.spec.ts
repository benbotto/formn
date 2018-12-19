import { Connection } from 'mysql2/promise';

import { metaFactory, RelationshipStore, TableStore, ColumnStore,
  PropertyMapStore, EntityType } from '../../metadata/';

import { initDB, User } from '../../test/';

import { MySQLEscaper, MySQLExecuter, DeleteModel } from '../';

describe('DeleteModel()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let executer: MySQLExecuter;
  let con: jasmine.SpyObj<Connection>;
  let getDelete: <T>(Entity: EntityType<T>, model: T) => DeleteModel<T>;

  beforeEach(() => {
    initDB();

    tblStore  = metaFactory.getTableStore();
    colStore  = metaFactory.getColumnStore();
    relStore  = metaFactory.getRelationshipStore();
    propStore = metaFactory.getPropertyMapStore();
    escaper   = new MySQLEscaper();
    con       = jasmine.createSpyObj('con', ['query']);
    executer  = new MySQLExecuter(con);

    // Get a DeleteModel instance using an entity type and entity.
    getDelete = <T>(Entity: EntityType<T>, model: T) =>
      new DeleteModel(colStore, tblStore, relStore, propStore, escaper, executer, Entity, model);
  });

  describe('.toString()', () => {
    it('throws an error if the primary key is not set.', () => {
      const user = new User();

      expect(() => getDelete(User, user))
        .toThrowError('The primary key is required when mutating a model, but "id" is missing.');
    });

    it('returns the correct delete statement for a model', () => {
      const user = new User();
      user.id = 42;

      const del = getDelete(User, user);

      expect(del.toString()).toBe(
        'DELETE  `users`\n' +
        'FROM    `users` AS `users`\n' +
        'WHERE   (`users`.`userID` = :users_id_0)');
    });
  });

  describe('.execute()', () => {
    let deleteSpy: jasmine.Spy;

    beforeEach(() => {
      deleteSpy = spyOn(executer, 'delete');
      deleteSpy.and.returnValue(Promise.resolve({affectedRows: 1}));
    });

    it('uses the Executer.delete method to execute the query.', (done) => {
      const user = new User();
      user.id = 42;

      const del = getDelete(User, user);

      del
        .execute()
        .then(u => {
          expect(u).toBe(user);
          done();
        });

      expect(deleteSpy.calls.argsFor(0)[0]).toBe(del.toString());
      expect(deleteSpy.calls.argsFor(0)[1]).toEqual({users_id_0: 42});
    });

    it('rejects with an error if no rows are affected.', (done) => {
      deleteSpy.and.returnValue(Promise.resolve({affectedRows: 0}));

      const user = new User();
      user.id = 42;
      user.first = 'Ben';
      user.last = 'Botto';

      getDelete(User, user)
        .execute()
        .catch(err => {
          expect(err.message).toBe('Delete operation did not affect any rows.');
          done();
        });
    });
  });
});

