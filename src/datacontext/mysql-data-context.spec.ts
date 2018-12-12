import * as mysql2 from 'mysql2/promise';

import { MySQLDataContext } from './mysql-data-context';
import { MySQLExecuter } from '../query/executer/mysql-executer';
import { MySQLEscaper } from '../query/escaper/mysql-escaper';
import { MySQLFromAdapter } from '../query/from/mysql-from-adapter';
import { Insert } from '../query/insert/insert';
import { MySQLUpdateModel } from '../query/update/mysql-update-model';
import { DeleteModel } from '../query/delete/delete-model';

import { ConnectionOptions } from '../connection/connection-options';

import { User } from '../test/entity/user.entity';

describe('MySQLDataContext()', () => {
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
});

