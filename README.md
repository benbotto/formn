Work in progress.

### Development Notes

##### Development Environment

Two docker containers are used during development:

  1. `formn-dev`: An Ubuntu Bionic container with Node.js Dubnium, with the code
     (this directory) mounted on `/home/node/dev/`.  This container has all the
     dependencies required to run the unit tests, build the application, and
     generate documentation.
  2. `formn-db`: A Percona 5.7 container with a `formn_test_db` database.  This
     container isn't strictly necessary for development, but while coding it's
     often useful to test against an actual database.  The tables mimic the
     entity definitions in `src/test/entity/`.  The database data and schema are
     defined in `docker-entrypoint-initdb.d/`.

To bring up the development environment, use Docker Compose: `docker-compose up
-d`.  The two containers can be seen by running `docker ps -a`.  Bring up a
bash shell in the dev environment with `docker-compose exec dev bash`.  From bash,
install the required dependencies using yarn:

```
cd dev
yarn
```

##### Tasks

Tasks such as building, testing, and generating documentation are defined in package.json as npm scripts.

  * `npm run build`: Build the application to ES6.  The build will be in
    `dist`.
  * `npm run doc`: Generate documentation for the project.  The documentation
    is created with TypeDoc and is located in the `doc` folder.
  * `npm run test`: Run the unit tests.  Unit tests are written for Jasmine.
  * `npm run test:debug`: Run the unit tests and break immediately.  From
    Chrome, navigate to `chrome://inspect` to debug the application.  (Using a
    `debugger` statement somewhere in the code is helpful.)
  * `npm run clean`: Remove the `dist` and `doc` folders.
  * `npm run watch:test`: Run the unit tests any time a ts file changes.
    Watching is done via chokidar-cli.

##### Unit Tests

Tests are written for Jasmine.  Each test suite lives alongside its counterpart
file (for example, `src/datamapper/schema.ts` is accompanied by
`src/datamapper/schema.spec.ts`).  There are also some helper scripts in
`src/test/` that are used to aid in the testing process.

  * `test/query/`: One-off queries that were used to generate database results
    for testing against actual datasets.
  * `test/entity/*.entity.ts`: Table definitions used when testing.  These
    definitions match the `formn_test_db` database.
  * `test/entity/database.ts`: Exports an `initDB()` function.  With formn,
    entities are defined using decorators, and these decorators create metadata
    about tables and columns.  Unit tests sometimes change these metadata
    definitions to test different scenarios.  `initDB()` manually decorates
    entity classes to prevent state from carrying over from one test to the
    next.  It's generally called from a test's `beforeEach` setup.

