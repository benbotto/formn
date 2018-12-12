import * as mysql2 from 'mysql2/promise';

import { MySQLConnectionManager } from './mysql-connection-manager';
import { ConnectionOptions } from './connection-options';

describe('MySQLConnectionManager()', () => {
  let createPoolSpy: jasmine.Spy;
  let mockPool: jasmine.SpyObj<mysql2.Pool>;
  let connOpts: ConnectionOptions;

  beforeEach(() => {
    mockPool = jasmine.createSpyObj('Pool', ['end']);
    mockPool.end.and.returnValue(Promise.resolve());

    createPoolSpy = spyOn(mysql2, 'createPool')
      .and.returnValue(mockPool);

    connOpts = {
      host: 'formn-db',
      user: 'formn-user',
      password: 'formn-password',
      database: 'formn_test_db',
      poolSize: 42,
    };
  });

  describe('.connect()', () => {
    it('creates a pool with the appropriate options.', () => {
      const connMan = new MySQLConnectionManager();

      expect(connMan.getConnectionState()).toBe('DISCONNECTED');
      connMan.connect(connOpts);
      expect(connMan.getConnectionState()).toBe('CONNECTED');

      const connOptArgs = createPoolSpy.calls.argsFor(0)[0];

      expect(connOptArgs).toEqual({
        host: 'formn-db',
        port: 3306, // Defaulted.
        user: 'formn-user',
        password: 'formn-password',
        database: 'formn_test_db',
        connectionLimit: 42,
        waitForConnections: true, // Defaulted.
        queueLimit: 0, // Defaulted.
        namedPlaceholders: true, // Defaulted.
      });
    });

    it('returns the connection pool immediately if the connection is already established.', () => {
      const connMan = new MySQLConnectionManager();

      connMan.connect(connOpts);
      connMan.connect(connOpts);

      expect(createPoolSpy.calls.count()).toBe(1);
    });
  });

  describe('.end()', () => {
    it('ends the connection.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan.connect(connOpts);
      connMan
        .end()
        .then(() => {
          expect(connMan.getConnectionState()).toBe('DISCONNECTED');
          done();
        });

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('returns immediately if the pools is disconnected.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan
        .end()
        .then(() => done());

      expect(mockPool.end).not.toHaveBeenCalled();
    });
  });

  describe('.getConnection()', () => {
    it('throws an error if the pool is not connected.', () => {
      const connMan = new MySQLConnectionManager();

      expect(() => connMan.getConnection())
        .toThrowError('MySQLConnectionManager.getConnection() called but the connection is not established.  Call connect().');
      
    });

    it('returns the connect pool.', () => {
      const connMan = new MySQLConnectionManager();

      connMan.connect(connOpts);

      expect(connMan.getConnection()).toBe(mockPool);
    });
  });
});

