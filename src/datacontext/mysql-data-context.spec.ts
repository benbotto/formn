import * as mysql2 from 'mysql2/promise';

import { MySQLExecuter, MySQLEscaper, MySQLFromAdapter, Insert,
  MySQLUpdateModel, DeleteModel } from '../query/';

import { ConnectionOptions } from '../connection/';

import { User } from '../test/';

import { MySQLDataContext, MySQLTransactionalDataContext } from './';

describe('MySQLDataContext()', () => {
  let createPoolSpy: jasmine.Spy;
  let mockPool: jasmine.SpyObj<mysql2.Pool>;
  let mockConn: jasmine.SpyObj<mysql2.Connection>;
  let connOpts: ConnectionOptions;

  beforeEach(() => {
    mockConn = jasmine.createSpyObj('Conn', ['release', 'query']);
    (mockConn.query as jasmine.Spy).and.returnValue(Promise.resolve());

    mockPool = jasmine.createSpyObj('Pool', ['end', 'getConnection']);
    mockPool.end.and.returnValue(Promise.resolve());
    (mockPool.getConnection as jasmine.Spy).and.returnValue(Promise.resolve(mockConn));

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

  describe('.getExecuter()', () => {
    it('throws an error if the ConnectionManager is not connected.', () => {
      const dc = new MySQLDataContext();

      expect(() => dc.getExecuter())
        .toThrowError('MySQLDataContext.getExecuter() called before connect().');
    });

    it('returns a MySQLExecuter instance.', (done) => {
      new MySQLDataContext()
        .connect(connOpts)
        .then(dc =>{
          expect(dc.getExecuter() instanceof MySQLExecuter).toBe(true);
          done();
        });
    });
  });

  describe('.getEscaper()', () => {
    it('returns a MySQLEscaper instance.', () => {
      expect(new MySQLDataContext().getEscaper() instanceof MySQLEscaper).toBe(true);
    });
  });

  describe('queries -', () => {
    let dc: MySQLDataContext;

    beforeEach(done => {
      new MySQLDataContext()
        .connect(connOpts)
        .then(dataContext => {
          dc = dataContext;
          done();
        });
    });

    describe('.insert()', () => {
      it('returns an Insert instance.', () => {
        const u = new User();
        u.first = 'Ben';

        const ins = dc.insert(User, u);

        expect(ins instanceof Insert).toBe(true);
      });
    });

    describe('.from()', () => {
      it('returns a MySQLFromAdapter instance.', () => {
        const from = dc.from(User, 'u');

        expect(from instanceof MySQLFromAdapter).toBe(true);
        expect(from.getBaseTableMeta().alias).toBe('u');
      });
    });

    describe('.update()', () => {
      it('returns a MySQLUpdateModel instance.', () => {
        const u = new User();

        u.id = 42;
        u.first = 'Ben';

        const upd = dc.update(User, u);

        expect(upd instanceof MySQLUpdateModel).toBe(true);
      });
    });

    describe('.delete()', () => {
      it('returns a DeleteModel instance.', () => {
        const u = new User();

        u.id = 42;
        u.first = 'Ben';

        const del = dc.delete(User, u);

        expect(del instanceof DeleteModel).toBe(true);
      });
    });
  });

  describe('.connect()', () => {
    it('connects the ConnectionManager.', (done) => {
      new MySQLDataContext()
        .connect(connOpts)
        .then(() => {
          expect(createPoolSpy).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('.end()', () => {
    it('ends the connection.', (done) => {
      new MySQLDataContext()
        .connect(connOpts)
        .then(dc => dc.end())
        .then(() => {
          expect(mockPool.end).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('.beginTransaction()', () => {
    it('produces a MySQLTransactionalDataContext instance.', (done) => {
      new MySQLDataContext()
        .connect(connOpts)
        .then(dc => {
          dc
            .beginTransaction(tdc => {
              expect(tdc instanceof MySQLTransactionalDataContext).toBe(true);
              done();
              return Promise.resolve();
            });
        });
    });
  });
});

