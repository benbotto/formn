import * as fs from 'fs';
import { join } from 'path';

import { PathHelper } from '../util/';

import { MySQLDataContext } from '../datacontext/';

import { Migrator, MIGRATION_TEMPLATE } from './';

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
});

