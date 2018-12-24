import { MySQLDataTypeMapper } from '../../';

describe('MySQLDataTypeMapper()', () => {
  describe('.getJSType()', () => {
    it('returns number for numeric types.', () => {
      const types = [
        'int',
        'smallint',
        'mediumint',
        'bigint',
        'float',
        'double',
      ];

      types.forEach(type =>
        expect(MySQLDataTypeMapper.getJSType(type, '')).toBe('number'));
    });

    it('returns boolean for tinyint(1).', () => {
      expect(MySQLDataTypeMapper.getJSType('tinyint', 'tinyint(1)')).toBe('boolean');
    });

    it('returns number for tinyint with size other than 1.', () => {
      expect(MySQLDataTypeMapper.getJSType('tinyint', 'tinyint(8)')).toBe('number');
    });

    it('returns Buffer for bits.', () => {
      expect(MySQLDataTypeMapper.getJSType('bit', 'bit(8)')).toBe('Buffer');
    });

    it('returns Date for date types.', () => {
      const types = ['date', 'datetime', 'timestamp'];

      types.forEach(type => expect(MySQLDataTypeMapper.getJSType(type, '')).toBe('Date'));
    });

    it('returns string by default.', () => {
      expect(MySQLDataTypeMapper.getJSType('varchar', '')).toBe('string');
      expect(MySQLDataTypeMapper.getJSType('foo', '')).toBe('string');
    });
  });
});

