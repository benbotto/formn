import { initDB, TypeTest } from '../../test/';
import { metaFactory } from '../../metadata/';

import { DeleteModelValidator } from '../';

describe('DeleteModelValidator()', () => {
  const validator = new DeleteModelValidator();

  beforeEach(() => initDB());

  describe('.validate()', () => {
    it('resolves if the primary key is present and valid.', (done) => {
      const tt = {
        int: 4
      };

      validator
        .validate(tt, TypeTest)
        .then(() => done());
    });

    it('rejects if the primary key is undefined.', (done) => {
      const tt = {
      };

      validator
        .validate(tt, TypeTest)
        .catch(errList => {
          expect(errList.errors.length).toBe(1);
          expect(errList.errors[0].field).toBe('int');
          expect(errList.errors[0].detail).toBe('"int" must be defined.');
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

    it('rejects if the primary key is the wrong type.', (done) => {
      const tt = {
        int: 4.2
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

    it('resolves if the primary key is present and valid, even if other properties are invalid.', (done) => {
      const tt = {
        int: 4,
        email: 'invalid-email',
        str: false
      };

      validator
        .validate(tt, TypeTest)
        .then(() => done());
    });
  });
});

