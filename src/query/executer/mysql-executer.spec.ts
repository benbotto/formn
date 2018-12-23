import { Connection } from 'mysql2/promise';

import { MySQLExecuter, Executer } from '../';

describe('MySQLExecuter()', () => {
  let con: jasmine.SpyObj<Connection>;
  let qe: MySQLExecuter;

  beforeEach(() => {
    // Mocked node-mysql connection.
    con = jasmine.createSpyObj('con', ['query']);
    qe  = new MySQLExecuter(con);
  });

  describe('.constructor()', () => {
    it('exposes a "pool" object.', () => {
      expect(qe.pool).toBe(con);
    });
  });

  describe('.select()', () => {
    it('uses pool.query() to execute the select statements.', (done) => {
      const params   = {};
      const query    = 'SELECT userID FROM users';

      con.query.and.returnValue(Promise.resolve([[{userID: 1}], {}]));

      qe
        .select(query, params)
        .then(result => {
          expect(result[0].userID).toBe(1);
          done();
        });

      expect(con.query.calls.argsFor(0)).toEqual([query, params]);
    });
  });

  describe('.insert()', () => {
    it('uses pool.query() to execute insert statements.', (done) => {
      const params   = {};
      const query    = 'INSERT INTO users (firstName) VALUES (:firstName)';

      con.query.and.returnValue(Promise.resolve([{insertId: 42}, {}]));

      qe
        .insert(query, params)
        .then(result => {
          expect(result.insertId).toBe(42);
          done();
        });

      expect(con.query.calls.argsFor(0)).toEqual([query, params]);
    });
  });

  describe('.delete()', () => {
    it('uses pool.query() to execute delete statements.', (done) => {
      const params   = {};
      const query    = 'DELETE FROM users WHERE userID = 1';

      con.query.and.returnValue(Promise.resolve([{affectedRows: 1}, {}]));
      qe
        .delete(query, params)
        .then(result => {
          expect(result.affectedRows).toBe(1);
          done();
        });

      expect(con.query.calls.argsFor(0)).toEqual([query, params]);
    });
  });

  describe('.update()', () => {
    it('uses pool.query() to execute update statements.', (done) => {
      const callback = {};
      const params   = {};
      const query    = "UPDATE users SET firstName = 'Joe' WHERE userID = 2";

      con.query.and.returnValue(Promise.resolve([{affectedRows: 1}, {}]));
      qe
        .update(query, params)
        .then(result => {
          expect(result.affectedRows).toBe(1);
          done();
        });

      expect(con.query.calls.argsFor(0)).toEqual([query, params]);
    });
  });

  describe('.query()', () => {
    it('uses pool.query() to execute the query.', (done) => {
      const callback = {};
      const params   = {};
      const query    = 'SELECT 1+1';

      con.query.and.returnValue(Promise.resolve());
      qe
        .query(query, params)
        .then(() => done())

      expect(con.query.calls.argsFor(0)).toEqual([query, params]);
    });
  });
});

