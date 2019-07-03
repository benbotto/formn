import * as fs from 'fs';
import { join } from 'path';

import { PathHelper } from '../util/';

import { MySQLDataContext } from '../datacontext/';

import { NullLogger } from '../logger/';

import { Migrator, MIGRATION_TEMPLATE, FormnMigration } from './';

describe('Migrator()', () => {
  class TestMigrator extends Migrator {
    createMigrationsTable(): Promise<void> {
      return Promise.resolve();
    }
  }

  let migrator: TestMigrator;
  let pathHelper: PathHelper;
  let dataContext: MySQLDataContext;
  let logger: NullLogger;
  let loadMigSpy: jasmine.Spy;

  beforeEach(() => {
    pathHelper = new PathHelper();
    dataContext = new MySQLDataContext();
    logger = new NullLogger();

    migrator = new TestMigrator(dataContext, '/path/to/migrations', logger, pathHelper);

    // This method is responsible for loading the migration script from disk
    // using require().  It's mocked to return a fake script.
    loadMigSpy = spyOn(migrator, 'loadMigrationScript');

    loadMigSpy.and
      .returnValue({
        up: () => Promise.resolve('up called'),
        down: () => Promise.resolve('down called')
      });
  });

  describe('.createMigrationsDir()', () => {
    it('creates the migrations directory.', (done) => {
      spyOn(pathHelper, 'mkdirIfNotExists').and.callFake(() => Promise.resolve());

      migrator
        .createMigrationsDir()
        .then(() => {
          expect(pathHelper.mkdirIfNotExists).toHaveBeenCalledWith('/path/to/migrations');
          done();
        });
    });

    it('creates the migrations directory with a custom path.', (done) => {
      spyOn(pathHelper, 'mkdirIfNotExists').and.callFake(() => Promise.resolve());
      const migrator = new TestMigrator(dataContext, 'custom', logger, pathHelper);

      migrator
        .createMigrationsDir()
        .then(() => {
          expect(pathHelper.mkdirIfNotExists).toHaveBeenCalledWith('custom');
          done();
        });
    });
  });

  describe('.create()', () => {
    it('throws an error if the migration name is too long.', (done) => {
      const tsLen   = 24;
      const maxLen  = 255;
      const migName = Array
        .from({length: 255 - tsLen + 1}, () => 'A')
        .join('');

      migrator
        .create(migName)
        .catch(err => {
          expect(err.message).toBe('Migration name must be no longer than 231 characters.');
          done();
        });
    });

    it('throws an error if the migration name contains non-word characters.', (done) => {
      const migName = 'foo bar';

      migrator
        .create(migName)
        .catch(err => {
          expect(err.message).toBe('Migrations names may only contain word characters (/^\w+$/).');
          done();
        });
    });

    it('creates the migration.', (done) => {
      spyOn(fs, 'writeFile').and.callFake((path: string, data: string) => {
        expect(data).toBe(MIGRATION_TEMPLATE);
        done();
      });

      migrator
        .create('create_table_foo');
    });
  });

  describe('.retrieve()', () => {
    it('pulls all the migrations from the database.', (done) => {
      const mockExecuter = jasmine.createSpyObj('executer', ['select']);

      mockExecuter.select.and
        .returnValue(Promise
          .resolve([
            {'fm.id': 1, 'fm.name': '1_fake', 'fm.runOn': '2019-07-02 01:02:03'},
            {'fm.id': 2, 'fm.name': '2_fake', 'fm.runOn': '2019-07-02 02:02:03'},
            {'fm.id': 3, 'fm.name': '3_fake', 'fm.runOn': '2019-07-03 02:02:03'},
          ]));

      spyOn(dataContext, 'getExecuter').and
        .returnValue(mockExecuter);

      migrator
        .retrieve()
        .then(migs => {
          expect(migs.length).toBe(3);
          migs.forEach(mig => expect(mig instanceof FormnMigration).toBe(true));
          done();
        });
    });
  });

  describe('.listMigrationFiles()', () => {
    it('pulls all the js files from the migrations directory in descending order.', (done) => {
      spyOn(pathHelper, 'ls').and.callFake((dir: string, match: RegExp, order: number) => {
        expect(dir).toBe('/path/to/migrations');
        expect(match.test('foo.js')).toBe(true);
        expect(order).toBe(-1);
        done();

        return Promise.resolve(['file1.js', 'file2.js']);
      });

      migrator
        .listMigrationFiles();
    });
  });

  describe('.runMigration()', () => {
    it('throws an error if a method corresponding to the direction is not defined.', (done) => {
      loadMigSpy.and.returnValue({});

      migrator
        .runMigration('fake_migration.js', 'up')
        .catch(err => {
          expect(err.message).toBe('"up" method not defined in migration "fake_migration.js."');
          done();
        });
    });

    it('runs the migration up and inserts a log.', (done) => {
      const mockExecuter = jasmine.createSpyObj('executer', ['insert']);

      mockExecuter.insert.and
        .returnValue(Promise.resolve({insertId: 42}));

      spyOn(dataContext, 'getExecuter').and
        .returnValue(mockExecuter);

      migrator
        .runMigration('fake_migration.js', 'up')
        .then(res => {
          expect(res).toBe('up called');
          expect(mockExecuter.insert).toHaveBeenCalled();
          done();
        });
    });

    it('runs the migration down and deletes the log.', (done) => {
      const mockExecuter = jasmine.createSpyObj('executer', ['delete']);

      mockExecuter.delete.and
        .returnValue(Promise.resolve({affectedRows: 1}));

      spyOn(dataContext, 'getExecuter').and
        .returnValue(mockExecuter);

      migrator
        .runMigration('fake_migration.js', 'down')
        .then(res => {
          expect(res).toBe('down called');
          expect(mockExecuter.delete).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('.up()', () => {
    it('runs any new migrations.', (done) => {
      const dbMigrations = [new FormnMigration(), new FormnMigration()];

      dbMigrations[0].id = 1;
      dbMigrations[0].name = 'migration1.js';
      dbMigrations[1].id = 2;
      dbMigrations[1].name = 'migration2.js';

      const migFiles = ['migration1.js', 'migration2.js', 'migration3.js'];

      spyOn(migrator, 'retrieve').and.returnValue(Promise.resolve(dbMigrations));
      spyOn(migrator, 'listMigrationFiles').and.returnValue(Promise.resolve(migFiles));
      const runMigSpy = spyOn(migrator, 'runMigration').and.returnValue(Promise.resolve());

      migrator
        .up()
        .then(() => {
          expect(runMigSpy.calls.count()).toBe(1);
          expect(runMigSpy.calls.argsFor(0)[0]).toBe('migration3.js');
          done();
        });
    });
  });
});

