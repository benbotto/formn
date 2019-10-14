import { ColumnLookup } from '../../metadata/';

import { ConditionMapper } from '../';

describe('ConditionMapper()', () => {
  const mapper = new ConditionMapper();

  describe('.map()', () => {
    let columnLookup: ColumnLookup;

    beforeEach(() => {
      columnLookup = new ColumnLookup();

      columnLookup
        .addColumn('description', 'j.description')
        .addColumn('address', 'j.address')
        .addColumn('status', 'j.status');
    });

    it('converts a single comparison.', () => {
      const cond = {$eq: {'description': ':desc'}};
      const newCond = mapper.map(cond, columnLookup);

      expect(newCond).toEqual({$eq: {'j.description': ':desc'}});
    });

    it('converts null conditions.', () => {
      const cond = {$is: {'description': null as any}};
      const newCond = mapper.map(cond, columnLookup);

      expect(newCond).toEqual({$is: {'j.description': null}});
    });

    it('converts parameterized null conditions.', () => {
      const cond = {$is: {'description': ':desc'}};
      const newCond = mapper.map(cond, columnLookup);

      expect(newCond).toEqual({$is: {'j.description': ':desc'}});
    });

    it('converts in conditions.', () => {
      const cond = {$in: {'status': [':s0', ':s1']}};
      const newCond = mapper.map(cond, columnLookup);

      expect(newCond).toEqual({$in: {'j.status': [':s0', ':s1']}});
    });

    it('converts boolean conditions.', () => {
      const cond = {
        $and: [
          {$eq: {'address': ':addr'}},
          {
            $or: [
              {$eq: {'status': 'Pending'}},
              {$eq: {'status': 'Paid'}},
            ]
          }
        ]
      };

      const newCond = mapper.map(cond, columnLookup);

      expect(newCond).toEqual({
        $and: [
          {$eq: {'j.address': ':addr'}},
          {
            $or: [
              {$eq: {'j.status': 'Pending'}},
              {$eq: {'j.status': 'Paid'}},
            ]
          }
        ]
      });
    });

    it('throws an error if a parameter replacement is missing.', () => {
      try {
        const cond = {$eq: {'description': ':foo'}};
        const params = {};

        mapper.map(cond, columnLookup, params);
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Replacement value for parameter "foo" not present.');
      }
    });

    it('throws an error if a parameter is missing on a nested condition.', () => {
      try {
        const cond = {
          $and: [
            {$eq: {'description': ':foo'}},
            {$eq: {'name': ':nane'}},
          ]
        };
        const params = {name: 'Bob'};

        mapper.map(cond, columnLookup, params);
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Replacement value for parameter "foo" not present.');
      }
    });

    it('throws an error if the column is not present in the lookup.', () => {
      try {
        const cond = {$eq: {'foo': ':foo'}};
        const params = {};

        mapper.map(cond, columnLookup, params);
        expect(true).toBe(false);
      }
      catch (err) {
        expect(err.message).toBe('Property "foo" not found in ColumnLookup.');
      }
    });
  });
});
