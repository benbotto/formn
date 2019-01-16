import { DefaultTableFormatter, ModelTable } from '../';

describe('DefaultTableFormatter()', () => {
  let formatter: DefaultTableFormatter;

  beforeEach(() => formatter = new DefaultTableFormatter());

  describe('.formatClassName()', () => {
    it('returns the singular version of the table name.', () => {
      const tbl = new ModelTable(formatter);
      tbl.setName('people');
      expect(tbl.getClassName()).toBe('Person');
    });

    it('returns the pascal version of the table name.', () => {
      const tbl = new ModelTable(formatter);
      tbl.setName('vehicle_packages');
      expect(tbl.getClassName()).toBe('VehiclePackage');
    });
  });

  describe('.formatImportName()', () => {
    it('returns the singular version of the table name in kebab case.', () => {
      const tbl = new ModelTable(formatter);
      tbl.setName('vehicle_packages');
      expect(tbl.getImportFileName()).toBe('vehicle-package.entity.ts');
    });

    it('has a schema prefix if there\'s a schema.', () => {
      const tbl = new ModelTable(formatter);
      tbl.setName('vehicle_packages');
      tbl.setSchema('a_schema');
      expect(tbl.getImportFileName()).toBe('a-schema-vehicle-package.entity.ts');
    });
  });
});

