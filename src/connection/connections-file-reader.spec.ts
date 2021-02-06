import { ConnectionsFileReader } from './';

describe('ConnectionsFileReader()', () => {
  const env = Object.assign({}, process.env);
  let reader: ConnectionsFileReader;

  beforeEach(() => reader = new ConnectionsFileReader());
  afterEach(() => process.env = env);

  describe('.readConnectionOptions()', () => {
    it('throws an error if the file is not found.', () => {
      expect(() => reader.readConnectionOptions('/fake/path/connections.json'))
        .toThrowError('Failed to require connections file "/fake/path/connections.json"');
    });

    it('returns the ConnectionOptions for a valid connections.json file.', () => {
      const connOpts = reader.readConnectionOptions('src/test/connection/connections.json');

      expect(connOpts.length).toBe(1);
      expect(connOpts[0].host).toBe('formn-db');
      expect(connOpts[0].user).toBe('root');
      expect(connOpts[0].password).toBe('formn-password');
      expect(connOpts[0].database).toBe('formn_test_db');
      expect(connOpts[0].poolSize).toBe(50);
      expect(connOpts[0].port).toBe(3306);
    });

    it('raises an error if an env var is not set.', () => {
      expect(() =>
        reader.readConnectionOptions('src/test/connection/connections.env.json'))
        .toThrowError('Environment variable "DB_HOST" not set.');
    });

    it('reads settings from env vars.', () => {
      process.env.DB_HOST = 'formn-db';
      process.env.DB_USER = 'root';
      process.env.DB_PASSWORD = 'formn-password';
      process.env.DB_DATABASE = 'formn_test_db';
      process.env.DB_POOL_SIZE = '50';
      process.env.DB_PORT = '3306';

      const connOpts = reader.readConnectionOptions('src/test/connection/connections.env.json')[0];

      expect(connOpts.host).toBe('formn-db');
      expect(connOpts.user).toBe('root');
      expect(connOpts.password).toBe('formn-password');
      expect(connOpts.database).toBe('formn_test_db');
      expect(connOpts.poolSize).toBe(50);
      expect(connOpts.port).toBe(3306);
    });
  });
});

