import { ModelColumn, DefaultColumnFormatter } from '../';

describe('ModelColumn()', () => {
  let col: ModelColumn;

  beforeEach(() => col = new ModelColumn(new DefaultColumnFormatter()));

  describe('.getName()', () => {
    it('returns undefined by default.', () => {
      expect(col.getName()).not.toBeDefined();
    });

    it('returns the table name.', () => {
      col.setName('age');
      expect(col.getName()).toBe('age');
    });
  });

  describe('.getPropertyName()', () => {
    it('returns the camel case version of the name.', () => {
      col.setName('likes_to_eat_cake');
      expect(col.getPropertyName()).toBe('likesToEatCake');
    });
  });

  describe('.getDecoratorString()', () => {
    it('returns a column decorator by default.', () => {
      expect(col.getDecoratorString()).toBe('  @Column()');
    });

    it('has the name property.', () => {
      col.setName('likes_to_eat_cake');
      expect(col.getDecoratorString()).toBe("  @Column({name: 'likes_to_eat_cake'})");
    });

    it('does not include the name property if the column name matches the property name.', () => {
      col.setName('age'); 
      expect(col.getDecoratorString()).toBe('  @Column()');
    });

    it('includes the isPrimary flag when true.', () => {
      col.setIsPrimary(true);
      expect(col.getDecoratorString()).toBe('  @Column({isPrimary: true})');
    });

    it('includes the isGenerated flag when true.', () => {
      col.setIsGenerated(true);
      expect(col.getDecoratorString()).toBe('  @Column({isGenerated: true})');
    });

    it('includes the hasDefault flag when true.', () => {
      col.setHasDefault(true);
      expect(col.getDecoratorString()).toBe('  @Column({hasDefault: true})');
    });

    it('includes the isNullable flag when false.', () => {
      col.setIsNullable(false);
      expect(col.getDecoratorString()).toBe('  @Column({isNullable: false})');
    });

    it('includes the maxLength.', () => {
      col.setMaxLength(255);
      expect(col.getDecoratorString()).toBe('  @Column({maxLength: 255})');
    });
  });

  describe('.getPropertyString()', () => {
    it('throws an error if there is no name.', () => {
      expect(() => col.getPropertyString()).toThrowError('ModelColumn instance has no name.');
    });

    it('throws an error if there is no datatype.', () => {
      col.setName('name');
      expect(() => col.getPropertyString()).toThrowError('ModelColumn instance has no data type.');
    });

    it('returns the property string.', () => {
      col.setName('likes_food');
      col.setDataType('boolean');

      expect(col.getPropertyString()).toBe('  likesFood: boolean');
    });
  });

  describe('toString()', () => {
    it('returns a string representation of the column.', () => {
      col.setName('likes_food');
      col.setDataType('boolean');
      col.setHasDefault(true);

      expect(col.toString())
        .toBe("  @Column({name: 'likes_food', hasDefault: true})\n" +
              "  likesFood: boolean;");
    });
  });
});

