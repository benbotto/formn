import { ModelRelationship } from '../';

describe('ModelRelationship()', () => {
  let rel: ModelRelationship;

  beforeEach(() => rel = new ModelRelationship());

  describe('.getLocalTableName()', () => {
    it('throws an error if the tables are not set.', () => {
      expect(() => rel.getLocalTableName()).toThrowError('ModelRelationship instance has no tables.');
    });

    it('returns the local table name.', () => {
      rel.setTables('people', 'phone_numbers', 'OneToMany');

      expect(rel.getLocalTableName()).toBe('Person');
    });
  });

  describe('.getReferencedClassName()', () => {
    it('throws an error if the tables are not set.', () => {
      expect(() => rel.getReferencedClassName()).toThrowError('ModelRelationship instance has no tables.');
    });

    it('returns the Referenced table name.', () => {
      rel.setTables('people', 'phone_numbers', 'OneToMany');

      expect(rel.getReferencedClassName()).toBe('PhoneNumber');
    });
  });

  describe('.getOnString()', () => {
    it('throws an error if the columns are not set.', () => {
      expect(() => rel.getOnString()).toThrowError('ModelRelationship instance has no columns.');
    });

    it('returns a single set of columns.', () => {
      rel.addColumns('id', 'userID');
      expect(rel.getOnString()).toBe('(l, r) => [l.id, r.userId]');
    });

    it('returns composite columns', () => {
      rel.addColumns('id', 'userId');
      rel.addColumns('l1', 'r2');
      expect(rel.getOnString()).toBe('(l, r) => [[l.id, r.userId], [l.l1, r.r2]]');
    });
  });

  describe('.getDecoratorString()', () => {
    it('returns the decorator string', () => {
      rel.setTables('people', 'phone_numbers', 'OneToMany');
      rel.addColumns('id', 'userID');
      
      expect(rel.getDecoratorString())
        .toBe('  @OneToMany<Person, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.userId])');
    });
  });

  describe('.getPropertyString()', () => {
    it('returns a one-to-many property.', () => {
      rel.setTables('people', 'phone_numbers', 'OneToMany');
      rel.addColumns('id', 'userID');
      
      expect(rel.getPropertyString())
        .toBe('  phoneNumbers: PhoneNumber[];');
    });

    it('returns a many-to-one property.', () => {
      rel.setTables('phone_numbers', 'people', 'ManyToOne');
      rel.addColumns('userID', 'id');
      
      expect(rel.getPropertyString())
        .toBe('  person: Person;')
    });
  });

  describe('.toString()', () => {
    it('returns the decorator and property.', () => {
      rel.setTables('people', 'phone_numbers', 'OneToMany');
      rel.addColumns('id', 'userID');
      
      expect(rel.toString())
        .toBe('  @OneToMany<Person, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.userId])\n' +
              '  phoneNumbers: PhoneNumber[];');
      
    });
  });
});

