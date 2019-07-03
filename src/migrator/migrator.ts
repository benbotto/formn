import * as moment from 'moment';
import { join } from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';

import { PathHelper } from '../util/';

import { DataContext } from '../datacontext/';

import { Logger, ConsoleLogger } from '../logger/';

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
   * @param logger - A [[Logger]] instance for logging info about the migration
   * process.
   * @param pathHelper - A [[PathHelper]] instance for creating the migration
   * directory.
   */
  constructor(
    protected dataContext: DataContext,
    protected migDir: string = 'migrations',
    protected logger: Logger = new ConsoleLogger(),
    protected pathHelper: PathHelper = new PathHelper()) {
  }

  /**
   * Create the migrations table if it doesn't exist.
   */
  abstract createMigrationsTable(): Promise<void>;

  /**
   * Create a migration.
   * @param migrationName - The name of the migration file.
   */
  create(migrationName: string, migDir?: string): Promise<void> {
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
   * Run all new migrations.
   */
  async up(): Promise<void> {
    // Migrations in the database, newest first.
    // Migration files without the path, ordered by name descending.
    const [dbMigrations, migFiles] = await Promise
      .all([this.retrieve(), this.listMigrationFiles()]);

    // A list of migration files that don't exist in the db.
    const newMigrations = migFiles
      .filter(file => !dbMigrations
        .find(dbMig => dbMig.name === file));

    for (let migration of newMigrations)
      await this.runMigration(migration, 'up');
  }

  /**
   * Bring down the last migration.
   */
  async down(): Promise<void> {
    // The latest migration.
    // All migration files.
    const [latestMig, migFiles] = await Promise
      .all([this.retrieveLatest(), this.listMigrationFiles()]);

    if (!latestMig)
      throw new Error('No migration to bring down.');

    if (!migFiles.find(file => file === latestMig.name))
      throw new Error(`Migration file "${latestMig.name}" not found.`);

    return this.runMigration(latestMig.name, 'down');
  }

  /**
   * Run a script against the database.
   * @param migration - The migration script, which will be resolved using
   * [[PathHelper#getAbsolutePath]].
   */
  async run(migration: string): Promise<any> {
    const absMigPath = this.pathHelper.getAbsolutePath(migration);
    const migScript  = this.loadMigrationScript(absMigPath);

    if (!(migScript as any).run)
      throw new Error(`"run" method not defined in script "${migration}."`);

    this.logger.log('-------------------------------------------------------------');
    this.logger.log(`Invoking "run" in file "${migration}."`);
    this.logger.log('-------------------------------------------------------------');

    const res = await (migScript as any).run(this.dataContext);

    this.logger.log('Result: ', res);

    return res;
  }

  /**
   * Create the migration directory if it doesn't exist.
   */
  createMigrationsDir(): Promise<void> {
    return this.pathHelper
      .mkdirIfNotExists(this.migDir);
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

  /**
   * Retrieve the latest migration, or null if there are no migrations.
   */
  retrieveLatest(): Promise<FormnMigration> {
    return this
      .retrieve()
      .then(migs => migs.length ? migs[0] : null);
  }

  /**
   * List all the migration files in the migrations directory, ordered by name,
   * descending (newest first).
   */
  listMigrationFiles(): Promise<string[]> {
    return this.pathHelper
      .ls(this.migDir, /^.*\.js$/, -1);
  }

  /**
   * Helper to load a migration script.  It's just a wrapper around require(),
   * but is helpful for mocking.
   * @param migration - The full path to the migration script.
   */
  loadMigrationScript(migration: string): object {
    return require(migration);
  }

  /**
   * Run a migration in a given direction (up or down).
   * @param migration - The migration file without the path.
   * @param direction - The direction, up or down.
   * @return The return value from the migration method is returned.
   */
  async runMigration(migration: string, direction: string): Promise<any> {
    const absMigPath = join(this.pathHelper.getAbsolutePath(this.migDir), migration);
    const migScript  = this.loadMigrationScript(migration);

    if (!(migScript as any)[direction])
      throw new Error(`"${direction}" method not defined in migration "${migration}."`);

    this.logger.log('-------------------------------------------------------------');
    this.logger.log(`Running migration ${direction} in file ${migration}.`);
    this.logger.log('-------------------------------------------------------------');

    // Run the migration.
    const res = await (migScript as any)[direction](this.dataContext);

    this.logger.log('Result: ', res);

    // Add/remove the migration record.
    if (direction === 'up') {
      const migRecord = new FormnMigration();

      migRecord.name = migration;

      await this.dataContext
        .insert(FormnMigration, migRecord)
        .execute();
    }
    else {
      await this.dataContext
        .from(FormnMigration, 'fm')
        .where({$eq: {'fm.name': ':name'}}, {name: migration})
        .delete()
        .execute();
    }

    return res;
  }
}

