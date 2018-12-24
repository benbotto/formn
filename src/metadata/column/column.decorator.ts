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

    const dataType = Reflect.getMetadata('design:type', target, propName);

    metaFactory
      .getColumnStore()
      .addColumnMetadata(new ColumnMetadata(target.constructor, propName, dataType, options));

    metaFactory
      .getPropertyMapStore()
      .addProperty(target.constructor, propName);
  }
}

