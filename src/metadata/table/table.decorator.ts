import { TableMetaOptions, TableMetadata, TableType, metaFactory } from '../';

/**
 * Decorator that is applied to a class to make it ORM capable.  That is, it
 * registers the class with formn so that it can be mapped to and from a
 * database table.  The decorator registers the class's [[TableMetadata]] in
 * the [[TableStore]].
 */
export function Table(options: TableMetaOptions = new TableMetaOptions()) {
  return function(ctor: TableType) {
    if (!options.name)
      options.name = ctor.name;

    metaFactory
      .getTableStore()
      .addTableMetadata(new TableMetadata(ctor, options.name, options.schema));
  }
}

