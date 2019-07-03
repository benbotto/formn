import { PathHelper } from '../util/';

import { MySQLDataContext } from '../datacontext/';

import { NullLogger } from '../logger/';

import { MySQLMigrator } from './';

describe('Migrator()', () => {
  let migrator: MySQLMigrator;
  let pathHelper: PathHelper;
  let dataContext: MySQLDataContext;
  let logger: NullLogger;

  beforeEach(() => {
    pathHelper = new PathHelper();
    dataContext = new MySQLDataContext();
    logger = new NullLogger();

    migrator = new MySQLMigrator(dataContext, 'migrations', logger, pathHelper);
  });

  describe('.createMigrationsTable()', () => {
    it('creates the migration table.', (done) => {
      const connectSpy = spyOn(dataContext, 'connect');
      const execSpy    = jasmine.createSpyObj('executer', ['query']);

      spyOn(dataContext, 'getExecuter').and.returnValue(execSpy);

      execSpy.query.and.returnValue(Promise.resolve());

      migrator
        .createMigrationsTable()
        .then(() => {
          expect(execSpy.query.calls.argsFor(0)[0].indexOf('CREATE TABLE')).not.toBe(-1);
          done();
        });
    });
  });
});

