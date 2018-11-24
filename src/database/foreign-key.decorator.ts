import { ForeignKeyMetaOptions } from './foreign-key-meta-options';
import metaFactory from './metadata-factory';
import { ForeignKeyMetadata } from './foreign-key-metadata';

export function ForeignKey(options: ForeignKeyMetaOptions) {
  return function(target: any, propName: string) {
    const fk = new ForeignKeyMetadata(
      target.constructor,
      options.column,
      propName,
      options.getReferencedTable);

    metaFactory.addForeignKeyMetadata(fk);
  }
}

