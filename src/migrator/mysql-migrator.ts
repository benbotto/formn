import { Migrator } from './';

import { DataContext } from '../datacontext/';

import { PathHelper } from '../util/';

import { Logger, ConsoleLogger } from '../logger/';

/**
 * Database migrator for MySQL.
 */
export class MySQLMigrator extends Migrator {
  /**
   * Initialize the migrator with [[PathHelper]] and [[MySQLDataContext]]
   * instances.
   * @param dataContext - A connected [[DataContext]] instance use for
   * running queries.
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

    super(dataContext, migDir, logger, pathHelper);
  }

  /**
   * Create the migrations table if it doesn't exist.
   */
  createMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS formn_migrations (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        runOn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name NVARCHAR(255) NOT NULL
      )`;

    return this.dataContext
      .getExecuter()
      .query(sql, {});
  }
}

