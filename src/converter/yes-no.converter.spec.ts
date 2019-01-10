import { YesNoConverter } from './';

describe('YesNoConverter()', () => {
  let conv: YesNoConverter;

  beforeEach(() => conv = new YesNoConverter());

  describe('.onRetrieve()', () => {
    it('converts "yes" and "YES" to true.', () => {
      expect(conv.onRetrieve('yes')).toBe(true);
      expect(conv.onRetrieve('YES')).toBe(true);
    });

    it('converts other strings to false.', () => {
      expect(conv.onRetrieve('no')).toBe(false);
      expect(conv.onRetrieve('other')).toBe(false);
    });
  });

  describe('.onSave()', () => {
    it('converts the value true to "YES."', () => {
      expect(conv.onSave(true)).toBe('YES');
    });

    it('converts other values to "NO."', () => {
      expect(conv.onSave(false)).toBe('NO');
      expect(conv.onSave('a')).toBe('NO');
    });
  });
});

