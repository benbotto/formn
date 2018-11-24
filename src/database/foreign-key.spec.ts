import { ForeignKey } from './foreign-key';

describe('ForeignKey()', () => {
  describe('.constructor()', () => {
    it('stores the table, column, refTable, and refColumn.', () => {
      const fk = new ForeignKey('phone_numbers', 'userID', 'users', 'id');

      expect(fk.table).toBe('phone_numbers');
      expect(fk.column).toBe('userID');
      expect(fk.refTable).toBe('users');
      expect(fk.refColumn).toBe('id');
    });
  });
});
