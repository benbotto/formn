import {
  ModelRelationship, DefaultColumnFormatter, DefaultTableFormatter,
  ModelColumn, ModelTable, DefaultRelationshipFormatter
} from '../';

import {
  getPeopleModelTable, getPhoneNumbersModelTable, getVehiclesModelTable,
  getVehiclePackagesModelTable
} from '../../test/';

describe('ModelRelationship()', () => {
  let rel: ModelRelationship;
  let people: ModelTable;
  let phoneNumbers: ModelTable;
  let vehicles: ModelTable;
  let vehiclePackages: ModelTable;

  beforeEach(() => {
    rel = new ModelRelationship(new DefaultRelationshipFormatter());

    people          = getPeopleModelTable();
    phoneNumbers    = getPhoneNumbersModelTable();
    vehicles        = getVehiclesModelTable();
    vehiclePackages = getVehiclePackagesModelTable();
  });

  describe('.getLocalClassName()', () => {
    it('throws an error if the tables are not set.', () => {
      expect(() => rel.getLocalClassName()).toThrowError('ModelRelationship instance has no tables.');
    });

    it('returns the local table name.', () => {
      rel.setTables(people, phoneNumbers, 'OneToMany');

      expect(rel.getLocalClassName()).toBe('Person');
    });
  });

  describe('.getReferencedClassName()', () => {
    it('throws an error if the tables are not set.', () => {
      expect(() => rel.getReferencedClassName()).toThrowError('ModelRelationship instance has no tables.');
    });

    it('returns the Referenced table name.', () => {
      rel.setTables(people, phoneNumbers, 'OneToMany');

      expect(rel.getReferencedClassName()).toBe('PhoneNumber');
    });
  });

  describe('.getOnString()', () => {
    it('throws an error if the columns are not set.', () => {
      expect(() => rel.getOnString()).toThrowError('ModelRelationship instance has no columns.');
    });

    it('returns a single set of columns.', () => {
      rel
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      expect(rel.getOnString()).toBe('(l, r) => [l.id, r.personId]');
    });

    it('returns composite columns', () => {
      rel
        .setTables(vehicles, vehiclePackages, 'OneToMany')
        .addColumns(
          vehicles.getColumnByName('make'),
          vehiclePackages.getColumnByName('make'))
        .addColumns(
          vehicles.getColumnByName('model'),
          vehiclePackages.getColumnByName('model'));

      expect(rel.getOnString()).toBe('(l, r) => [[l.make, r.make], [l.model, r.model]]');
    });
  });

  describe('.getDecoratorString()', () => {
    it('returns the decorator string', () => {
      rel
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      expect(rel.getDecoratorString())
        .toBe('  @OneToMany<Person, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.personId])');
    });
  });

  describe('.getPropertyString()', () => {
    it('returns a one-to-many property.', () => {
      rel
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      expect(rel.getPropertyString())
        .toBe('  phoneNumbers: PhoneNumber[];');
    });

    it('returns a many-to-one property.', () => {
      rel
        .setTables(phoneNumbers, people, 'ManyToOne')
        .addColumns(
          phoneNumbers.getColumnByName('personID'),
          people.getColumnByName('personID'));

      expect(rel.getPropertyString())
        .toBe('  person: Person;')
    });
  });


  describe('.toString()', () => {
    it('returns the decorator and property.', () => {
      rel
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      expect(rel.toString())
        .toBe('  @OneToMany<Person, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.personId])\n' +
              '  phoneNumbers: PhoneNumber[];');
    });
  });
});

