import { MySQLExecuter } from './mysql-executer';
import { Connection } from 'mysql2/promise';
import { Executer } from './executer';

describe('MySQLExecuter()', function() {
  let con: jasmine.SpyObj<Connection>;
  let qe: MySQLExecuter;

  beforeEach(function() {
    // Mocked node-mysql connection.
    con = jasmine.createSpyObj('con', ['query']);
    qe  = new MySQLExecuter(con);
  });

  describe('.constructor()', function() {
    it('exposes a "pool" object.', function() {
      expect(qe.pool).toBe(con);
    });
  });

  describe('.select()', function() {
    it('uses pool.query() to execute the select statements.', function(done) {
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

  describe('.insert()', function() {
    it('uses pool.query() to execute insert statements.', function(done) {
      const params   = {};
      const query    = 'INSERT INTO users (userName) VALUES (:username)';

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

  describe('.delete()', function() {
    it('uses pool.query() to execute delete statements.', function(done) {
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

  describe('.update()', function() {
    it('uses pool.query() to execute update statements.', function(done) {
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
});

