import 'jasmine';

import { ColumnMetadata } from './column-metadata';
import { Converter } from '../../converter/converter';

import { User } from '../../test/entity/user.entity';

describe('Column()', () => {
  describe('.constructor()', () => {
    it('stores the Entity, name, and mapTo properties.', function() {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName'});
      expect(col.name).toBe('firstName');
      expect(col.mapTo).toBe('first');
      expect(col.Entity).toBe(User);
    });

    it('defaults isPrimary to false.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName'});
      expect(col.isPrimary).toBe(false);
    });

    it('stores the isPrimary flag.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName', isPrimary: true});
      expect(col.isPrimary).toBe(true);
    });

    it('defaults isGenerated to false.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName'});
      expect(col.isGenerated).toBe(false);
    });

    it('stores the isGenerated flag.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName', isGenerated: true});
      expect(col.isGenerated).toBe(true);
    });

    it('defaults isNullable to true.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName'});
      expect(col.isNullable).toBe(true);
    });

    it('stores the isNullable flag.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName', isNullable: false});
      expect(col.isNullable).toBe(false);
    });

    it('stores the dataType property.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName', dataType: 'VARCHAR'});
      expect(col.dataType).toBe('VARCHAR');
    });

    it('stores the maxLength property.', () => {
      const col = new ColumnMetadata(User, 'first', {name: 'firstName', maxLength: 100});
      expect(col.maxLength).toBe(100);
    });

    it('stores the converter.', () => {
      const conv = new Converter();
      const col = new ColumnMetadata(User, 'first', {name: 'firstName', converter: conv});

      expect(col.converter).toBe(conv);
    });
  });

  describe('.createFQName()', () => {
    it('returns the unescaped name.', function() {
      expect(ColumnMetadata.createFQName('users', 'firstName')).toBe('users.firstName');
    });
  });
});

