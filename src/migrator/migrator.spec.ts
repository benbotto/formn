import * as fs from 'fs';
import { join } from 'path';

import { PathHelper } from '../util/';

import { MySQLDataContext } from '../datacontext/';

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

  beforeEach(() => {
    pathHelper = new PathHelper();
    dataContext = new MySQLDataContext();

    migrator = new TestMigrator(dataContext, 'migrations', pathHelper);
  });

  describe('.createMigrationsDir()', () => {
    it('creates the migrations directory.', (done) => {
      spyOn(pathHelper, 'mkdirIfNotExists').and.callFake(() => Promise.resolve());

      migrator
        .createMigrationsDir()
        .then(() => {
          expect(pathHelper.mkdirIfNotExists).toHaveBeenCalledWith('migrations');
          done();
        });
    });

    it('creates the migrations directory with a custom path.', (done) => {
      spyOn(pathHelper, 'mkdirIfNotExists').and.callFake(() => Promise.resolve());
      const migrator = new TestMigrator(dataContext, 'custom', pathHelper);

      migrator
        .createMigrationsDir()
        .then(() => {
          expect(pathHelper.mkdirIfNotExists).toHaveBeenCalledWith('custom');
          done();
        });
    });
  });

  describe('.createMigration()', () => {
    it('throws an error if the migration name is too long.', (done) => {
      const tsLen   = 24;
      const maxLen  = 255;
      const migName = Array
        .from({length: 255 - tsLen + 1}, () => 'A')
        .join('');

      migrator
        .createMigration(migName)
        .catch(err => {
          expect(err.message).toBe('Migration name must be no longer than 231 characters.');
          done();
        });
    });

    it('throws an error if the migration name contains non-word characters.', (done) => {
      const migName = 'foo bar';

      migrator
        .createMigration(migName)
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
        .createMigration('create_table_foo');
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
});

