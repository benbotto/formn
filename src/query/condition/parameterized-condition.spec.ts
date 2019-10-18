import { ParameterizedCondition, ConditionBuilder } from '../';

describe('ParameterizedCondition()', () => {
  describe('.normalize()', () => {
    it('returns the ParameterizedCondition instance.', () => {
      const cond = new ConditionBuilder()
        .eq('u.id', ':userId', 42);

      expect(ParameterizedCondition.normalize(cond)).toBe(cond);
    });

    it('converts cond and params objects to a ParameterizedCondition instance.', () => {
      const cond   = {'$eq': {'u.id': ':userId'}};
      const params = {userId: 42};
      const pCond  = ParameterizedCondition.normalize(cond, params);

      expect(pCond.getCond()).toBe(cond);
      expect(pCond.getParams().userId).toBe(42);
    });

    it('uses an empty object if no parameters are supplied.', () => {
      const cond   = {'$eq': {'u.id': 'p.userId'}};
      const pCond  = ParameterizedCondition.normalize(cond);

      expect(pCond.getCond()).toBe(cond);
      expect(pCond.getParams()).toEqual({});
    });
  });
});

