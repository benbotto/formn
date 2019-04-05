import { SubModelTypeValidator } from '../';

describe('SubModelTypeValidator()', () => {
  describe('.validate()', () => {
    const v = new SubModelTypeValidator('OneToMany');

    it('skips the validation if the value is undefined.', () => {
      expect(v.validate(undefined)).toBe(true);
    });

    describe('OneToMany -', () => {
      const v = new SubModelTypeValidator('OneToMany');

      it('returns true if the value is an array.', () => {
        expect(v.validate([])).toBe(true);
        expect(v.validate([{}, {}])).toBe(true);
      });

      it('returns false if the value is not an array.', () => {
        expect(v.validate({})).toBe(false);
        expect(v.validate(0)).toBe(false);
      });

      it('returns false if the value is an array, but the elements are not objects.', () => {
        expect(v.validate([null])).toBe(false);
        expect(v.validate([{}, 1])).toBe(false);
      });

      it('returns false if the value is null.', () => {
        expect(v.validate(null)).toBe(false);
      });
    });

    describe('ManyToOne -', () => {
      const v = new SubModelTypeValidator('ManyToOne');

      it('returns true if the value is an object.', () => {
        class Foo {};

        expect(v.validate({})).toBe(true);
        expect(v.validate(new Foo())).toBe(true);
        expect(v.validate(new Date())).toBe(true);
        expect(v.validate(new Number(3))).toBe(true);
      });

      it('returns false if the value is not an object.', () => {
        expect(v.validate([])).toBe(false);
        expect(v.validate(1)).toBe(false);
        expect(v.validate('a')).toBe(false);
      });

      it('returns true if the value is null.', () => {
        expect(v.validate(null)).toBe(true);
      });
    });
  });

  describe('.getErrorMessage()', () => {
    it('returns an error message.', () => {
      const v1 = new SubModelTypeValidator('OneToMany');
      expect(v1.getErrorMessage('foo')).toBe('"foo" must be a valid array.');

      const v2 = new SubModelTypeValidator('ManyToOne');
      expect(v2.getErrorMessage('foo')).toBe('"foo" must be a valid object.');
    });
  });
});

