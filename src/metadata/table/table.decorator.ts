import { TableMetaOptions } from './table-meta-options';
import { TableMetadata } from './table-metadata';
import { EntityType } from './entity-type';
import metaFactory from '../metadata-factory';

/**
 * Decorator that is applied to a class to make it ORM capable.  That is, it
 * registers the class with formn so that it can be mapped to and from a
 * database table.  The decorator registers the class's [[TableMetadata]] in
 * the [[TableStore]].
 */
export function Table(options: TableMetaOptions = new TableMetaOptions()) {
  return function(ctor: EntityType) {
    if (!options.name)
      options.name = ctor.name;

    if (!options.database)
      options.database = 'default';

    metaFactory
      .getTableStore()
      .addTableMetadata(new TableMetadata(ctor, options.name, options.database));
  }
}

