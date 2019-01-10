import {
  ModelTable, ModelRelationship, ModelColumn, DefaultTableFormatter,
  DefaultColumnFormatter, DefaultRelationshipFormatter
} from '../';

import {
  getPeopleModelTable, getPhoneNumbersModelTable, getVehiclesModelTable,
  getVehiclePackagesModelTable
} from '../../test/';

describe('ModelTable()', () => {
  let people: ModelTable;
  let phoneNumbers: ModelTable;
  let vehicles: ModelTable;
  let vehiclePackages: ModelTable;

  beforeEach(() => {
    people          = getPeopleModelTable();
    phoneNumbers    = getPhoneNumbersModelTable();
    vehicles        = getVehiclesModelTable();
    vehiclePackages = getVehiclePackagesModelTable();
  });

  describe('.getName()', () => {
    it('throws an error if no name is set.', () => {
      const tbl = new ModelTable(new DefaultTableFormatter());

      expect(() => tbl.getName()).toThrowError('ModelTable instance has no name.');
    });

    it('returns the table name.', () => {
      expect(people.getName()).toBe('people');
    });
  });

  describe('.getClassName()', () => {
    it('returns the singular pascal version of the table name.', () => {
      expect(vehiclePackages.getClassName()).toBe('VehiclePackage');
    });
  });

  describe('.getImportName()', () => {
    it('returns the singular version of the table name in kebab case.', () => {
      expect(vehiclePackages.getImportName()).toBe('vehicle-package.entity');
    });
  });

  describe('.getImportFileName()', () => {
    it('returns the singular version of the table name in kebab case.', () => {
      expect(vehiclePackages.getImportFileName()).toBe('vehicle-package.entity.ts');
    });
  });

  describe('.getSchema()', () => {
    it('returns undefined by default.', () => {
      expect(vehiclePackages.getSchema()).not.toBeDefined();
    });

    it('returns the sechema.', () => {
      vehiclePackages.setSchema('dbo');
      expect(vehiclePackages.getSchema()).toBe('dbo');
    });
  });

  describe('.getColumnByName()', () => {
    it('throws an error if the column is not found.', () => {
      expect(() => people.getColumnByName('foo')).toThrowError('Column "foo" not found.');
    });

    it('returns the column.', () => {
      expect(people.getColumnByName('personID').getName()).toBe('personID');
    });
  });

  describe('.getDecoratorString()', () => {
    it('returns a decorator string with the table name.', () => {
      expect(people.getDecoratorString()).toBe("@Table({name: 'people'})");
    });

    it('does not include the table name if the table name matches the class name.', () => {
      const tbl = new ModelTable(new DefaultTableFormatter())
        .setName('Person');
      expect(tbl.getDecoratorString()).toBe('@Table()');
    });

    it('returns a decorator string with the schema.', () => {
      const tbl = new ModelTable(new DefaultTableFormatter())
        .setName('Person')
        .setSchema('dbo');

      expect(tbl.getDecoratorString()).toBe("@Table({schema: 'dbo'})");
    });

    it('returns a decorator string with the table and schema.', () => {
      const tbl = new ModelTable(new DefaultTableFormatter())
        .setName('people')
        .setSchema('dbo');

      expect(tbl.getDecoratorString()).toBe("@Table({name: 'people', schema: 'dbo'})");
    });
  });

  describe('.getClassString()', () => {
    it('returns the class definition string.', () => {
      expect(people.getClassString()).toBe('export class Person');
    });
  });

  describe('.getFormnImportsString()', () => {
    it('returns the formn imports string.', () => {
      expect(people.getFormnImportsString()).toBe("import { Table, Column } from 'formn';");
    });

    it('includes decorator imports.', () => {
      const rel = new ModelRelationship(new DefaultRelationshipFormatter())
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      people.addRelationship(rel);

      expect(people.getFormnImportsString())
        .toBe("import { Table, Column, OneToMany } from 'formn';");
    });
  });

  describe('getModelImportsString()', () => {
    it('returns an empty string if there are no relationships.', () => {
      expect(people.getModelImportsString()).toBe('');
    });

    it('returns an import for each referenced model.', () => {
      const rel = new ModelRelationship(new DefaultRelationshipFormatter())
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      people.addRelationship(rel);

      expect(people.getModelImportsString())
        .toBe("import { PhoneNumber } from './phone-number.entity';");
    });
  });

  describe('.toString()', () => {
    it('returns a string representation of the model.', () => {
      const rel = new ModelRelationship(new DefaultRelationshipFormatter())
        .setTables(people, phoneNumbers, 'OneToMany')
        .addColumns(
          people.getColumnByName('personID'),
          phoneNumbers.getColumnByName('personID'));

      people.addRelationship(rel);

      const modelStr = people.toString();

      expect(modelStr)
        .toBe(
`import { Table, Column, OneToMany } from 'formn';

import { PhoneNumber } from './phone-number.entity';

@Table({name: 'people'})
export class Person {
  @Column({name: 'personID', isPrimary: true, isGenerated: true})
  id: number;

  @Column({isNullable: false, maxLength: 255})
  name: string;

  @OneToMany<Person, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.personId])
  phoneNumbers: PhoneNumber[];
}
`);
    });
  });
});

