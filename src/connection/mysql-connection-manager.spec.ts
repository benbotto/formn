import * as mysql2 from 'mysql2/promise';

import { MySQLConnectionManager } from './mysql-connection-manager';
import { ConnectionOptions } from './connection-options';

describe('MySQLConnectionManager()', () => {
  let createPoolSpy: jasmine.Spy;
  let mockPool: jasmine.SpyObj<mysql2.Pool>;
  let mockConn: jasmine.SpyObj<mysql2.PoolConnection>;
  let connOpts: ConnectionOptions;

  beforeEach(() => {
    mockPool = jasmine.createSpyObj('Pool', ['end', 'getConnection']);
    mockPool.end.and.returnValue(Promise.resolve());

    mockConn = jasmine.createSpyObj('Conn', ['release']);
    mockPool.getConnection.and.returnValue(Promise.resolve(mockConn));

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
    it('creates a pool with the appropriate options.', (done) => {
      const connMan = new MySQLConnectionManager();

      expect(connMan.getConnectionState()).toBe('DISCONNECTED');
      connMan
        .connect(connOpts)
        .then(pool => {
          expect(connMan.getConnectionState()).toBe('CONNECTED');
          done();
        });

      expect(connMan.getConnectionState()).toBe('CONNECTING');

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

    it('sets the connection state to DISCONNECTED if there is a failure connecting.', (done) => {
      const err = new Error('');
      mockPool.getConnection.and.returnValue(Promise.reject(err));

      const connMan = new MySQLConnectionManager();

      connMan
        .connect(connOpts)
        .catch(e => {
          expect(e).toBe(err);
          expect(connMan.getConnectionState()).toBe('DISCONNECTED');
          done();
        });
    });
  });

  describe('.end()', () => {
    it('ends the connection.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan.connect(connOpts);
      connMan
        .end()
        .then(() => {
          expect(mockPool.end).toHaveBeenCalled();
          expect(connMan.getConnectionState()).toBe('DISCONNECTED');
          done();
        });
    });

    it('returns immediately if the pool is disconnected.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan
        .end()
        .then(() => done());

      expect(mockPool.end).not.toHaveBeenCalled();
    });

    it('waits for the connection to finish if the pool is in a CONNECTING state.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan.connect(connOpts);
      connMan
        .end()
        .then(() => {
          expect(mockPool.end).toHaveBeenCalled();
          expect(connMan.getConnectionState()).toBe('DISCONNECTED');
          done();
        });
    });

    it('sets the connection state to DISCONNECTED if there is a failure connecting.', (done) => {
      const err = new Error('');
      mockPool.getConnection.and.returnValue(Promise.reject(err));

      const connMan = new MySQLConnectionManager();

      connMan.connect(connOpts);
      connMan
        .end()
        .catch(e => {
          expect(e).toBe(err);
          expect(mockPool.end).not.toHaveBeenCalled();
          expect(connMan.getConnectionState()).toBe('DISCONNECTED');
          done();
        });
    });
  });

  describe('.getConnection()', () => {
    it('throws an error if the pool is not connected.', () => {
      const connMan = new MySQLConnectionManager();

      expect(() => connMan.getConnection())
        .toThrowError('MySQLConnectionManager.getConnection() called but the connection is not established.  Call connect().');
      
    });

    it('returns a connection from the pool.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan
        .connect(connOpts)
        .then(() => connMan.getConnection())
        .then(conn => {
          expect(conn).toBe(mockConn);
          done();
        });
    });
  });

  describe('.getPool()', () => {
    it('throws an error if the pool is not connected.', () => {
      const connMan = new MySQLConnectionManager();

      expect(() => connMan.getPool())
        .toThrowError('MySQLConnectionManager.getPool() called but the connection is not established.  Call connect().');
      
    });

    it('returns the pool.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan
        .connect(connOpts)
        .then(() => {
          expect(connMan.getPool()).toBe(mockPool);
          done();
        });
    });
  });

  describe('.release()', () => {
    it('releases the connection.', (done) => {
      const connMan = new MySQLConnectionManager();

      connMan
        .connect(connOpts)
        .then(() => connMan.getConnection())
        .then(conn => {
          connMan.release(conn);
          expect(mockConn.release).toHaveBeenCalled();
          done();
        });
    });
  });
});

