import * as mysql2 from 'mysql2/promise';

import { MySQLConnectionManager } from '../connection/';

import { MySQLTransactionManager } from './';

describe('MySQLTransactionManager()', () => {
  let connMan: jasmine.SpyObj<MySQLConnectionManager>;
  let mockConn: jasmine.SpyObj<mysql2.PoolConnection>;
  let transMgr: MySQLTransactionManager;

  beforeEach(() => {
    mockConn = jasmine.createSpyObj('conn', ['query']);
    mockConn.query.and.returnValue(Promise.resolve());

    connMan = jasmine.createSpyObj('connMan', ['getConnection', 'release']);
    connMan.getConnection.and.returnValue(Promise.resolve(mockConn));

    transMgr = new MySQLTransactionManager(connMan);
  });

  describe('.getTransactionState()', () => {
    it('is initially in the "READY" state.', () => {
      expect(transMgr.getTransactionState()).toBe('READY');
    });
  });

  describe('.getConnection()', () => {
    it('throws an error if the transaction has not been started.', () => {
      expect(() => transMgr.getConnection()).toThrowError('TransactionManager.getConnection attempt while transaction state is "READY."');
    });

    it('returns the PoolConnection object.', (done) => {
      transMgr
        .begin()
        .then(() => {
          expect(transMgr.getConnection()).toBe(mockConn);
          done();
        });
    });
  });

  describe('.begin()', () => {
    it('starts the transaction when the state is "READY."', (done) => {
      const begin = transMgr
        .begin();

      expect(transMgr.getTransactionState()).toBe('STARTING');

      begin
        .then(() => {
          expect(mockConn.query).toHaveBeenCalledWith('START TRANSACTION');
          expect(transMgr.getTransactionState()).toBe('STARTED');
          done();
        });
    });

    it('resolves immediately when the state is "STARTED."', (done) => {
      transMgr
        .begin()
        .then(() => transMgr.begin())
        .then(() => {
          expect(mockConn.query.calls.count()).toBe(1);
          expect(transMgr.getTransactionState()).toBe('STARTED');
          done();
        });
    });

    it('throws an error in other states.', (done) => {
      transMgr.begin(); // "STARTING" state.
        transMgr
        .begin()
        .catch(err => {;
          expect(err.message).toBe('TransactionManager.begin attempt while transaction state is "STARTING."');
          done();
        });
    });
  });

  describe('.commit()', () => {
    it('commits the transaction.', (done) => {
      transMgr
        .begin()
        .then(() => {
          transMgr.commit();
          expect(transMgr.getTransactionState()).toBe('COMMITTING');
        })
        .then(() => {
          expect(mockConn.query).toHaveBeenCalledWith('COMMIT');
          expect(connMan.release).toHaveBeenCalledWith(mockConn);
          expect(transMgr.getTransactionState()).toBe('COMMITTED');
          done();
        });
    });

    it('throws an error if the state is not "STARTED."', (done) => {
      transMgr
        .begin()
        .then(() => {
          transMgr.commit(); // COMMITTING state.
          return transMgr.commit();
        })
        .catch(err => {
          expect(err.message).toBe('TransactionManager.commit attempt while transaction state is "COMMITTING."');
          done();
        });
    });
  });

  describe('.rollback()', () => {
    it('rolls back the transaction.', (done) => {
      transMgr
        .begin()
        .then(() => {
          transMgr.rollback();
          expect(transMgr.getTransactionState()).toBe('ROLLING_BACK');
        })
        .then(() => {
          expect(mockConn.query).toHaveBeenCalledWith('ROLLBACK');
          expect(connMan.release).toHaveBeenCalledWith(mockConn);
          expect(transMgr.getTransactionState()).toBe('ROLLED_BACK');
          done();
        });
    });

    it('throws an error if the state is not "STARTED."', (done) => {
      transMgr
        .begin()
        .then(() => {
          transMgr.rollback(); // ROLLING_BACK state.
          return transMgr.rollback();
        })
        .catch(err => {
          expect(err.message).toBe('TransactionManager.rollback attempt while transaction state is "ROLLING_BACK."');
          done();
        });
    });
  });
});

