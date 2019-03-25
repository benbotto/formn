import { initDB, TypeTest } from '../../test/';
import { metaFactory } from '../../metadata/';

import { UpdateModelValidator } from '../';

describe('UpdateModelValidator()', () => {
  const validator = new UpdateModelValidator();

  beforeEach(() => initDB());

  describe('.validate()', () => {
    describe('parent chain -', () => {
      it('resolves if all values are the correct type and the pk is present.', (done) => {
        const tt = {
          int: 4,
          email: 'asdf@asdf.com'
        };

        validator
          .validate(tt, TypeTest)
          .then(() => done());
      });

      it('rejects if the pk is present but a value is not the correct type.', (done) => {
        const tt = {
          int: 4,
          str: false
        };

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors.length).toBe(1);
            expect(errList.errors[0].field).toBe('str');
            expect(errList.errors[0].message).toBe('"str" must be a string.');
            done();
          });
      });

      it('rejects if the pk is present but custom validation fails.', (done) => {
        const tt = {
          int: 4,
          email: 'invalid-email'
        };

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors.length).toBe(1);
            expect(errList.errors[0].field).toBe('email');
            expect(errList.errors[0].detail).toBe('"email" must be a valid email address.');
            done();
          });
      });
    });

    describe('primary key requirement -', () => {
      it('rejects if the primary key is missing.', (done) => {
        const tt = {};

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors.length).toBe(1);
            expect(errList.errors[0].field).toBe('int');
            expect(errList.errors[0].detail).toBe('"int" must be defined.');
            done();
          });
      });

      it('rejects if the primary key is the wrong type.', (done) => {
        const tt = {
          int: 4.7
        };

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors.length).toBe(1);
            expect(errList.errors[0].field).toBe('int');
            expect(errList.errors[0].detail).toBe('"int" must be a valid integer.');
            done();
          });
      });

      it('rejects if the primary key is null, even if it\'s nullable.', (done) => {
        const tt = {
          int: null as any
        };

        // Make "int" nullable.
        metaFactory
          .getColumnStore()
          .getColumnMetadataByMapping(TypeTest, 'int')
          .isNullable = true;

        validator
          .validate(tt, TypeTest)
          .catch(errList => {
            expect(errList.errors.length).toBe(1);
            expect(errList.errors[0].field).toBe('int');
            expect(errList.errors[0].detail).toBe('"int" must not be null.');
            done();
          });
      });
    });
  });
});

