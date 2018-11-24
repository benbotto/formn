import 'reflect-metadata';

import { ColumnMetaOptions } from './column-meta-options';
import { ColumnMetadata } from './column-metadata';

import metaFactory from './metadata-factory';

export function Column(options: ColumnMetaOptions = new ColumnMetaOptions()) {
  return function(target: any, propName: string) {
    if (!options.name)
      options.name = propName;

    // TODO: This isn't going to work with relational types (e.g. a related
    // entity).
    if (!options.dataType) {
      const type = Reflect.getMetadata('design:type', target, propName);

      switch (type.name) {
        case 'Number':
          options.dataType = 'INT';
          break;
        case 'Date':
          options.dataType = 'DATETIME';
          break;
        case 'String':
          options.dataType = 'VARCHAR';
          break;
        default:
          options.dataType = type.name;
          break;
      }
    }

    metaFactory
      .getColumnMetadata()
      .push(new ColumnMetadata(target.constructor, propName, options));
  }
}

