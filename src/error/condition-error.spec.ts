import { ConditionError } from './';

describe('ConditionError()', function() {
  describe('.constructor()', function() {
    it('has the correct message, name, and detail.', function() {
      const ce = new ConditionError('An error.');

      expect(ce.name).toBe('ConditionError');
      expect(ce.message).toBe('An error.');
      expect(ce.detail).toBe('An error.');
    });
  });
});

