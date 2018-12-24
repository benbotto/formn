import { ModelTable, ModelRelationship, ModelColumn } from '../';

describe('ModelTable()', () => {
  let tbl: ModelTable;

  beforeEach(() => tbl = new ModelTable());

  describe('.getName()', () => {
    it('throws an error if no name is set.', () => {
      expect(() => tbl.getName()).toThrowError('ModelTable instance has no name.');
    });

    it('returns the table name.', () => {
      tbl.setName('people');
      expect(tbl.getName()).toBe('people');
    });
  });

  describe('.getClassName()', () => {
    it('returns the singular version of the table name.', () => {
      tbl.setName('people');
      expect(tbl.getClassName()).toBe('Person');
    });

    it('returns the pascal version of the table name.', () => {
      tbl.setName('vehicle_packages');
      expect(tbl.getClassName()).toBe('VehiclePackage');
    });
  });

  describe('.getImportName()', () => {
    it('returns the singular version of the table name in kebab case.', () => {
      tbl.setName('vehicle_packages');
      expect(tbl.getImportName()).toBe('vehicle-package.entity');
    });
  });

  describe('.getImportFileName()', () => {
    it('returns the singular version of the table name in kebab case.', () => {
      tbl.setName('vehicle_packages');
      expect(tbl.getImportFileName()).toBe('vehicle-package.entity.ts');
    });
  });

  describe('.getSchema()', () => {
    it('returns undefined by default.', () => {
      expect(tbl.getSchema()).not.toBeDefined();
    });

    it('returns the sechema.', () => {
      tbl.setSchema('dbo');
      expect(tbl.getSchema()).toBe('dbo');
    });
  });

  describe('.getDecoratorString()', () => {
    it('returns a decorator string with the table name.', () => {
      tbl.setName('people');
      expect(tbl.getDecoratorString()).toBe("@Table({name: 'people'})");
    });

    it('does not include the table name if the table name matches the class name.', () => {
      tbl.setName('Person');
      expect(tbl.getDecoratorString()).toBe('@Table()');
    });

    it('returns a decorator string with the schema.', () => {
      tbl.setName('Person');
      tbl.setSchema('dbo');

      expect(tbl.getDecoratorString()).toBe("@Table({schema: 'dbo'})");
    });

    it('returns a decorator string with the table and schema.', () => {
      tbl.setName('people');
      tbl.setSchema('dbo');

      expect(tbl.getDecoratorString()).toBe("@Table({name: 'people', schema: 'dbo'})");
    });
  });

  describe('.getClassString()', () => {
    it('returns the class definition string.', () => {
      tbl.setName('person');
      expect(tbl.getClassString()).toBe('export class Person');
    });
  });

  describe('.getFormnImportsString()', () => {
    it('returns the formn imports string.', () => {
      expect(tbl.getFormnImportsString()).toBe("import { Table, Column } from 'formn';");
    });

    it('includes decorator imports.', () => {
      const rel = new ModelRelationship();
      rel.setTables('people', 'phone_numbers', 'OneToMany');
      rel.addColumns('id', 'userID');

      tbl.setName('people');
      tbl.addRelationship(rel);

      expect(tbl.getFormnImportsString())
        .toBe("import { Table, Column, OneToMany } from 'formn';");
    });
  });

  describe('getModelImportsString()', () => {
    it('returns an empty string if there are no relationships.', () => {
      expect(tbl.getModelImportsString()).toBe('');
    });

    it('returns an import for each referenced model.', () => {
      const rel = new ModelRelationship();
      rel.setTables('people', 'phone_numbers', 'OneToMany');
      rel.addColumns('id', 'userID');

      const rel2 = new ModelRelationship();
      rel2.setTables('people', 'products', 'OneToMany');
      rel2.addColumns('id', 'userID');

      tbl.addRelationship(rel);
      tbl.addRelationship(rel2);

      expect(tbl.getModelImportsString())
        .toBe("import { PhoneNumber } from './phone-number.entity';\n" +
              "import { Product } from './product.entity';");
    });
  });

  describe('.toString()', () => {
    it('returns a string representation of the model.', () => {
      tbl.setName('people');

      let col = new ModelColumn();
      col.setName('id');
      col.setDataType('number');
      col.setIsPrimary(true);
      col.setIsGenerated(true);
      col.setIsNullable(false);
      tbl.addColumn(col);

      col = new ModelColumn();
      col.setName('firstName');
      col.setDataType('string');
      col.setMaxLength(255);
      col.setIsNullable(false);
      tbl.addColumn(col);

      col = new ModelColumn();
      col.setName('isActive');
      col.setDataType('boolean');
      col.setIsNullable(false);
      col.setHasDefault(true);
      tbl.addColumn(col);

      const rel = new ModelRelationship();
      rel.setTables('people', 'phone_numbers', 'OneToMany');
      rel.addColumns('id', 'userID');
      tbl.addRelationship(rel);

      const modelStr = tbl.toString();

      expect(modelStr)
        .toBe(
`import { Table, Column, OneToMany } from 'formn';

import { PhoneNumber } from './phone-number.entity';

@Table({name: 'people'})
export class Person {
  @Column({isPrimary: true, isGenerated: true, isNullable: false})
  id: number;

  @Column({isNullable: false, maxLength: 255})
  firstName: string;

  @Column({hasDefault: true, isNullable: false})
  isActive: boolean;

  @OneToMany<Person, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.userId])
  phoneNumbers: PhoneNumber[];
}
`);
    });
  });
});

