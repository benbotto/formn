import * as moment from 'moment';
import { join } from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';

import { PathHelper } from '../util/';

import { DataContext } from '../datacontext/';

import { MIGRATION_TEMPLATE, FormnMigration } from './';

/**
 * Driver for running database migrations.
 */
export abstract class Migrator {
  /**
   * Initializate the migrator.
   * @param dataContext - A connected [[DataContext]] instance use for running
   * queries.
   * @param migDir - The directory to use for migration scripts, which defaults
   * to "migrations."  If the path is not absolute, it's considered relative to
   * the current working directory.
   * @param pathHelper - A [[PathHelper]] instance for creating the migration
   * directory.
   */
  constructor(
    protected dataContext: DataContext,
    protected migDir: string = 'migrations',
    protected pathHelper: PathHelper = new PathHelper()) {
  }

  /**
   * Create the migrations table if it doesn't exist.
   */
  abstract createMigrationsTable(): Promise<void>;

  /**
   * Create the migration directory if it doesn't exist.
   */
  createMigrationsDir(): Promise<void> {
    return this.pathHelper
      .mkdirIfNotExists(this.migDir);
  }

  /**
   * Create a migration.
   * @param migrationName - The name of the migration file.
   */
  createMigration(migrationName: string, migDir?: string): Promise<void> {
    const timestamp  = moment().format('YYYY-MM-DD__HH-mm-ss-SSS');
    const fullName   = `${timestamp}__${migrationName}.js`;
    const fullPath   = join(this.pathHelper.getAbsolutePath(this.migDir), fullName);
    const maxLen     = 255 - timestamp.length;
    const writeFileP = promisify(writeFile);

    if (migrationName.length > maxLen)
      return Promise.reject(new Error(`Migration name must be no longer than ${maxLen} characters.`));

    if (!migrationName.match(/^\w+$/))
      return Promise.reject(new Error('Migrations names may only contain word characters (/^\w+$/).'));

    return writeFileP(fullPath, MIGRATION_TEMPLATE);
  }

  /**
   * Retrieve all the migrations from the database.
   */
  retrieve(): Promise<FormnMigration[]> {
    return this.dataContext
      .from<FormnMigration>(FormnMigration, 'fm')
      .select()
      .orderBy({property: 'fm.name', dir: 'DESC'})
      .execute();
  }
}

