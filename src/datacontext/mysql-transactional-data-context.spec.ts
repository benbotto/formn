import { MySQLTransactionManager } from '../transaction';
import { MySQLTransactionalDataContext } from './';
import { MySQLExecuter } from '../query/';

describe('MySQLTransactionalDataContext()', () => {
  let transMgr: jasmine.SpyObj<MySQLTransactionManager>;
  let dataContext: MySQLTransactionalDataContext;

  beforeEach(() => {
    transMgr = jasmine.createSpyObj('transMgr', [
      'getTransactionState',
      'getConnection',
      'begin',
      'commit',
      'rollback',
    ]);

    // Default transaction state is ready.
    transMgr.getTransactionState.and.returnValue('READY');

    // Begin, commit, and rollback by default return a resolved promise from
    // the mock.
    transMgr.begin.and.callFake(() => {
      transMgr.getTransactionState.and.returnValue('STARTED');
      return Promise.resolve();
    });

    transMgr.commit.and.callFake(() => {
      transMgr.getTransactionState.and.returnValue('COMMITTED');
      return Promise.resolve();
    });

    transMgr.rollback.and.callFake(() => {
      transMgr.getTransactionState.and.returnValue('ROLLED_BACK');
      return Promise.resolve();
    });

    dataContext = new MySQLTransactionalDataContext(transMgr);
  });

  describe('.getExecuter()', () => {
    it('throws an error if the transaction is not started.', () => {
      expect(() => dataContext.getExecuter())
        .toThrowError('MySQLTransactionalDataContext.getExecuter() called before beginning transaction.');
    });

    it('returns an executer instance once the transaction has started.', (done) => {
      dataContext.beginTransaction(() => {
        expect(dataContext.getExecuter() instanceof MySQLExecuter).toBe(true);
        done();
        return Promise.resolve();
      });
    });
  });

  describe('.connect()', () => {
    it('is not implemented.', (done) => {
      dataContext
        .connect()
        .catch(err => {
          expect(err.message).toBe('connect() not implemented on MySQLTransactionalDataContext.');
          done();
        });
    });
  });

  describe('.end()', () => {
    it('is not implemented.', (done) => {
      dataContext
        .end()
        .catch(err => {
          expect(err.message).toBe('end() not implemented on MySQLTransactionalDataContext.');
          done();
        });
    });
  });

  describe('.beginTransaction()', () => {
    it('begins the transaction if the transaction state is "READY."', (done) => {
      dataContext
        .beginTransaction(() => {
          expect(transMgr.begin).toHaveBeenCalled();
          done();
          return Promise.resolve();
        });
    });

    it('does not beging the transaction if the transaction state is "STARTED."', (done) => {
      transMgr.getTransactionState.and.returnValue('STARTED');
      
      dataContext
        .beginTransaction(() => {
          expect(transMgr.begin).not.toHaveBeenCalled();
          done();
          return Promise.resolve();
        });
    });

    it('throws an error if the transaction state is not "READY" or "STARTED."', (done) => {
      transMgr.getTransactionState.and.returnValue('COMMITTED');
      
      dataContext
        .beginTransaction(() => Promise.resolve())
        .catch(err => {
          expect(err.message).toBe('MySQLTransactionalDataContext.beginTransaction() called while transaction state is "COMMITTED."');
          done();
        });
    });

    it('commits the transaction if the user-supplied transaction function returns a resolved promise.', (done) => {
      dataContext
        .beginTransaction(() => Promise.resolve())
        .then(() => {
          expect(transMgr.commit).toHaveBeenCalled();
          done();
        });
    });

    it('does not commit the transaction if the user manually rolls it back.', (done) => {
      dataContext
        .beginTransaction(() => {
          transMgr.getTransactionState.and.returnValue('ROLLED_BACK');
          return Promise.resolve();
        })
        .then(() => {
          expect(transMgr.commit).not.toHaveBeenCalled();
          done();
        });
      
    });

    it('rolls back the transaction if the user-supplied transaction function returns a rejected promise.', (done) => {
      const err = new Error('Rejected.');

      dataContext
        .beginTransaction(() => Promise.reject(err))
        .catch(e => {
          expect(e).toBe(err);
          expect(transMgr.rollback).toHaveBeenCalled();
          done();
        });
    });

    it('does not roll back the transaction if the user already rolled it back.', (done) => {
      const err = new Error('Rejected.');

      dataContext
        .beginTransaction(() => {
          transMgr.getTransactionState.and.returnValue('ROLLED_BACK');
          return Promise.reject(err);
        })
        .catch(e => {
          expect(e).toBe(err);
          expect(transMgr.rollback).not.toHaveBeenCalled();
          done();
        });
    });
  });

  describe('.rollbackTransaction()', () => {
    it('rolls back the transaction.', (done) => {
      dataContext
        .rollbackTransaction()
        .then(() => {
          expect(transMgr.rollback).toHaveBeenCalled();
          done()
        });
      
    });
  });
});

