import { RelationshipMetaOptions, metaFactory, RelationshipMetadata } from '../';

/**
 * Decorator for relationships between two [[Table]]-decorated classes.  See
 * [[RelationshipMetaOptions]] for the parameters.
 */
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

    metaFactory
      .getPropertyMapStore()
      .addProperty(target.constructor, propName);
  }
}

