import { TableMetaOptions } from './table-meta-options';
import { TableMetadata } from './table-metadata';
import { EntityType } from './entity-type';
import metaFactory from '../metadata-factory';

export function Table(options: TableMetaOptions = new TableMetaOptions()) {
  return function(ctor: EntityType) {
    if (!options.name)
      options.name = ctor.name;

    if (!options.database)
      options.database = 'default';

    metaFactory
      .getDatabaseMetaData(options.database)
      .addTable(new TableMetadata(ctor, options));
  }
}

