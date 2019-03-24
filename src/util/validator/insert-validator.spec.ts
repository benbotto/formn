import { initDB, TypeTest } from '../../test/';
import { Column } from '../../metadata/';

import { InsertValidator } from '../';

describe('InsertValidator()', () => {
  const validator = new InsertValidator();

  beforeEach(() => initDB());

  describe('.validate()', () => {
    describe('parent chain -', () => {
      // This test and the next two verify that ModelValidator (the parent validation)
      // still works.
      it('resolves if all values are the correct type.', (done) => {
        const tt = {
          email: 'asdf@asdf.com'
        };

        validator
          .validate(tt, TypeTest)
          .then(() => done());
      });

      it('rejects if a value is not the correct type.', (done) => {
        const tt = {
          str: false
        };

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors[0].field).toBe('str');
            expect(errList.errors[0].message).toBe('"str" must be a string.');
            done();
          });
      });

      it('rejects if custom validation fails.', (done) => {
        const tt = {
          email: 'invalid-email'
        };

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors[0].field).toBe('email');
            expect(errList.errors[0].detail).toBe('"email" must be a valid email address.');
            done();
          });
      });
    });

    describe('required -', () => {
      it('rejects if a non-nullable field that has no default is not present.', (done) => {
        let colDec;

        colDec = Column({maxLength: 10, sqlDataType: 'varchar', isNullable: false});
        colDec(TypeTest.prototype, 'str');

        colDec = Column({sqlDataType: 'timestamp', isNullable: false, hasDefault: true});
        colDec(TypeTest.prototype, 'dte');

        // Note that the "int" column is not nullable but generated, and the
        // "dte" column is not nullable but has a default.  These are not
        // required to be defined.
        const tt = {};

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors.length).toBe(1);
            expect(errList.errors[0].field).toBe('str');
            expect(errList.errors[0].detail).toBe('"str" must be defined.');
            done();
          });
      });

      it('rejects if a generated field has a value.', (done) => {
        // "int" is not nullable, but generated (like an auto-incrementing
        // primary key).  This cannot be manually set.
        const tt = {
          int: 4
        };

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors.length).toBe(1);
            expect(errList.errors[0].field).toBe('int');
            expect(errList.errors[0].detail).toBe('"int" must not be defined.');
            done();
          });
      });
    });
  });
});

