import { Escaper } from './escaper';
import { MSSQLEscaper } from './mssql-escaper';

describe('MSSQLEscaper()', function() {
  const escaper = new MSSQLEscaper();

  describe('.constructor().', function() {
    it('extends Escaper.', function() {
      expect(escaper instanceof Escaper).toBe(true);
      expect(escaper instanceof MSSQLEscaper).toBe(true);
    });
  });

  describe('.escapeProperty()', function() {
    it('escapes strings.', function() {
      expect(escaper.escapeProperty('name')).toBe('[name]');
    });

    it('preserves dots.', function() {
      expect(escaper.escapeProperty('my.name')).toBe('[my.name]');
    });
  });

  describe('.escapeFullqyQualifiedColumn()', function() {
    // Escapes a fully-qualified column.
    it('escapes the table and the column independently.', function() {
      expect(escaper.escapeFullyQualifiedColumn('users.firstName')).toBe('[users].[firstName]');
      expect(escaper.escapeFullyQualifiedColumn('users.first.Name')).toBe('[users].[first.Name]');
      expect(escaper.escapeFullyQualifiedColumn('phone_numbers.phoneNumber')).toBe('[phone_numbers].[phoneNumber]');
      expect(escaper.escapeFullyQualifiedColumn('phoneNumber')).toBe('[phoneNumber]');
    });
  });
});

