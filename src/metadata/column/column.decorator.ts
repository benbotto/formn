import 'reflect-metadata';

import { ColumnMetaOptions, ColumnMetadata, metaFactory } from '../';

/**
 * Decorator that is applied to a [[Table]]-decorated class's properties.  This
 * associates the property with a database column and registers it in the
 * [[ColumnStore]].
 */
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
      .getColumnStore()
      .addColumnMetadata(new ColumnMetadata(target.constructor, propName, options));

    metaFactory
      .getPropertyMapStore()
      .addProperty(target.constructor, propName);
  }
}

