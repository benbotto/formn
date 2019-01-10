import {
  DefaultRelationshipFormatter, ModelRelationship, ModelTable
} from '../';

import {
  getPeopleModelTable, getPhoneNumbersModelTable, getVehiclesModelTable,
  getVehiclePackagesModelTable
} from '../../test/';

describe('DefaultRelationshipFormatter()', () => {
  let formatter: DefaultRelationshipFormatter;
  let people: ModelTable;
  let phoneNumbers: ModelTable;
  let vehicles: ModelTable;
  let vehiclePackages: ModelTable;

  beforeEach(() => {
    formatter       = new DefaultRelationshipFormatter();

    people          = getPeopleModelTable();
    phoneNumbers    = getPhoneNumbersModelTable();
    vehicles        = getVehiclesModelTable();
    vehiclePackages = getVehiclePackagesModelTable();
  });

  describe('.formatPropertyName()', () => {
    it('uses the singular column name for single-column, many-to-one relationships.', () => {
      const rel = new ModelRelationship(formatter)
        .setTables(phoneNumbers, people, 'ManyToOne')
        .addColumns(
          phoneNumbers.getColumnByName('personID'),
          people.getColumnByName('personID'));

      expect(formatter.formatPropertyName(rel)).toBe('person');
    });

    it('uses the plural column name for single-column, one-to-many relationships.', () => {
      const rel = new ModelRelationship(formatter)
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      expect(formatter.formatPropertyName(rel)).toBe('phoneNumbers');
    });

    it('uses the singular class name for multi-column, many-to-one relatinoships.', () => {
      const rel = new ModelRelationship(formatter)
        .setTables(vehiclePackages, vehicles, 'ManyToOne')
        .addColumns(
          vehiclePackages.getColumnByName('make'),
          vehicles.getColumnByName('make'))
        .addColumns(
          vehiclePackages.getColumnByName('model'),
          vehicles.getColumnByName('model'));

      expect(formatter.formatPropertyName(rel)).toBe('vehicle');
    });

    it('uses the plural class name for multi-column, one-to-many relatinoships.', () => {
      const rel = new ModelRelationship(formatter)
        .setTables(vehicles, vehiclePackages, 'OneToMany')
        .addColumns(
          vehicles.getColumnByName('make'),
          vehiclePackages.getColumnByName('make'))
        .addColumns(
          vehicles.getColumnByName('model'),
          vehiclePackages.getColumnByName('model'));

      expect(formatter.formatPropertyName(rel)).toBe('vehiclePackages');
    });
  });
});

