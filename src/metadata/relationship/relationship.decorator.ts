import { RelationshipMetaOptions } from './relationship-meta-options';
import metaFactory from '../metadata-factory';
import { RelationshipMetadata } from './relationship-metadata';

export function Relationship<ENT_T, REF_ENT_T>(options: RelationshipMetaOptions<ENT_T, REF_ENT_T>) {
  return function(target: any, propName: string) {
    const rel = new RelationshipMetadata(
      target.constructor,   // Entity (property owner's ctor).
      propName,             // mapTo (decorated property).
      options.to,           // Getter for referenced Entity.
      options.on,           // Getter for the join Column-decorated properties.
      options.cardinality); // Relationship type.

    metaFactory
      .getRelationshipStore()
      .addRelationshipMetadata(rel);
  }
}

