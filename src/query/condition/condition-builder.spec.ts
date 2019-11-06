import { ConditionBuilder } from '../';

describe('ConditionBuilder()', () => {
  const cb = new ConditionBuilder();

  describe('.comp()', () => {
    it('throws an error if the operator is Invalid.', () => {
      expect(() =>
        cb.comp('$foo', 'p.firstName', ':first', 'Ben'))
        .toThrowError('Invalid condition operator "$foo."');
    });

    it('throws an error if the parameter does not start with a colon.', () => {
      expect(() =>
        cb.comp('$eq', 'p.firstName', 'first', 'Ben'))
        .toThrowError('Parameter names must start with a colon.');
    });
  });

  describe('.inComp()', () => {
    it('throws an error if the operator is Invalid.', () => {
      expect(() =>
        cb.inComp('$foo', 'p.firstName', ':first', ['Ben']))
        .toThrowError('Invalid condition operator "$foo."');
    });

    it('throws an error if the parameter does not start with a colon.', () => {
      expect(() =>
        cb.inComp('$in', 'p.firstName', 'first', ['Ben']))
        .toThrowError('Parameter names must start with a colon.');
    });

    it('throws an error if the parameter base name is not a string.', () => {
      expect(() =>
        cb.inComp('$in', 'p.firstName', [':first'], ['Ben']))
        .toThrowError('Parameter base name must be a string.');
    });

    it('throws an error if the properties list is not an array.', () => {
      expect(() =>
        cb.inComp('$in', 'p.firstName', 'foo'))
        .toThrowError('IN condition properties must be an array.');
    });
  });

  describe('.aggregateComp()', () => {
    it('throws an error if the operator is Invalid.', () => {
      expect(() =>
        cb.aggregateComp('$foo', cb.eq('p.firstName', ':first', 'Ben')))
        .toThrowError('Invalid condition operator "$foo."');
    });
  });

  describe('.eq()', () => {
    it('returns a ParameterizedCondition with a parameter.', () => {
      const cond = cb.eq('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$eq: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });

    it('returns a ParameterizedCondition without parameters.', () => {
      const cond = cb.eq('p.firstName', 'p.otherCol');

      expect(cond.getCond()).toEqual({$eq: {'p.firstName': 'p.otherCol'}});
      expect(cond.getParams()).toEqual({});
    });
  });

  describe('.neq()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.neq('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$neq: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });
  });

  describe('.lt()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.lt('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$lt: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });
  });

  describe('.lte()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.lte('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$lte: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });
  });

  describe('.gt()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.gt('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$gt: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });
  });

  describe('.gte()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.gte('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$gte: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });
  });

  describe('.like()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.like('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$like: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });
  });

  describe('.notLike()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.notLike('p.firstName', ':first', 'Ben');

      expect(cond.getCond()).toEqual({$notLike: {'p.firstName': ':first'}});
      expect(cond.getParams()).toEqual({first: 'Ben'});
    });
  });

  describe('.in()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.in('p.firstName', ':first', ['Ben', 'Jack', 'Joe']);

      expect(cond.getCond()).toEqual(
        {$in: {'p.firstName': [':first_0', ':first_1', ':first_2']}});
      expect(cond.getParams()).toEqual({first_0: 'Ben', first_1: 'Jack', first_2: 'Joe'});
    });

    it('returns a ParameterizedCondition with columns.', () => {
      const cond = cb.in('p.firstName', ['sue.name', 'joe.name']);

      expect(cond.getCond()).toEqual(
        {$in: {'p.firstName': ['sue.name', 'joe.name']}});
      expect(cond.getParams()).toEqual({});
    });
  });

  describe('.notIn()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.notIn('p.firstName', ':first', ['Ben', 'Jack', 'Joe']);

      expect(cond.getCond()).toEqual(
        {$notIn: {'p.firstName': [':first_0', ':first_1', ':first_2']}});
      expect(cond.getParams()).toEqual({first_0: 'Ben', first_1: 'Jack', first_2: 'Joe'});
    });
  });

  describe('.isNull()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.isNull('p.firstName');

      expect(cond.getCond()).toEqual({$is: {'p.firstName': null}});
      expect(cond.getParams()).toEqual({});
    });
  });

  describe('.isNotNull()', () => {
    it('returns a ParameterizedCondition.', () => {
      const cond = cb.isNotNull('p.firstName');

      expect(cond.getCond()).toEqual({$isnt: {'p.firstName': null}});
      expect(cond.getParams()).toEqual({});
    });
  });

  describe('.and()', () => {
    it('returns a ParameterizedCondition with conditions AND\'d together.', () => {
      const cond = cb.and(
        cb.eq('p.firstName', ':first', 'Ben'),
        cb.eq('p.lastName', ':last', 'Bot'));

      expect(cond.getCond()).toEqual({
        $and: [
          {$eq: {'p.firstName': ':first'}},
          {$eq: {'p.lastName': ':last'}},
        ]
      });
      expect(cond.getParams()).toEqual({first: 'Ben', last: 'Bot'});
    });

    it('ignores undefined conditions.', () => {
      const cond = cb.and(
        cb.eq('p.firstName', ':first', 'Ben'),
        undefined);

      expect(cond.getCond()).toEqual({
        $and: [
          {$eq: {'p.firstName': ':first'}}
        ]
      });
    });
  });

  describe('.or()', () => {
    it('returns a ParameterizedCondition with conditions OR\'d together.', () => {
      const cond = cb.or(
        cb.eq('p.firstName', ':first', 'Ben'),
        cb.eq('p.lastName', ':last', 'Bot'));

      expect(cond.getCond()).toEqual({
        $or: [
          {$eq: {'p.firstName': ':first'}},
          {$eq: {'p.lastName': ':last'}},
        ]
      });
      expect(cond.getParams()).toEqual({first: 'Ben', last: 'Bot'});
    });
  });
});

