import { ForeignKeyMetadata } from './foreign-key-metadata';

import { PhoneNumber } from '../test/entity/phone-number.entity';
import { User } from '../test/entity/user.entity';

describe('ForeignKey()', () => {
  describe('.constructor()', () => {
    it('stores the table, column, and reference.', () => {
      const fk = new ForeignKeyMetadata(PhoneNumber, 'userID', 'user', () => User);

      expect(fk.Entity).toBe(PhoneNumber);
      expect(fk.column).toBe('userID');
      expect(fk.mapTo).toBe('user');
      expect(fk.getRefEntity()).toBe(User);
    });
  });
});
