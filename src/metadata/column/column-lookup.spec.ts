import { ColumnLookup } from './column-lookup';

describe('ColumnLookup()', () => {
  describe('.getColumn()', () => {
    it('pulls the associated column name.', () => {
      const lookup = new ColumnLookup();

      lookup.addColumn('pn.id', 'pn.phoneNumberID');
      expect(lookup.getColumn('pn.id')).toBe('pn.phoneNumberID');
    });

    it('throws an error if the property does not exist in the lookup.', () => {
      const lookup = new ColumnLookup();
      expect(() => lookup.getColumn('foo'))
        .toThrowError('Property "foo" not found in ColumnLookup.');
    });
  });
});
