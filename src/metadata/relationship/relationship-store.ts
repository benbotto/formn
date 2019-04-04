import { assert } from '../../error/';

import { RelationshipMetadata, TableType } from '../';

/** Stores relationships and provides lookup functions. */
export class RelationshipStore {
  private relMetadata: RelationshipMetadata[] = [];

  /**
   * Add a relationship.
   */
  addRelationshipMetadata(rel: RelationshipMetadata): this {
    this.relMetadata.push(rel);

    return this;
  }

  /**
   * Get all of the relationships between two tables, or for a single table.
   * @param Entity1 - The first Entity (constructor), i.e. the class that's
   * decorated with @[[Table]].
   * @param Entity2 - The second Entity.
   * @param oneWay - When true, only return the relationships that Entity1
   * owns.
   * @param mapTo - An optional property on Entity1.  If passed, return the
   * relationship for this property only (implies oneWay).
   * @return An array of RelationshipMetadata instances.
   */
  getRelationships(
    Entity1: TableType,
    Entity2: TableType = null,
    oneWay: boolean = false,
    mapTo: string = null): RelationshipMetadata[] {

    let t1Rels, t2Rels;

    t1Rels = this.relMetadata
      .filter(rel =>
        rel.Entity === Entity1 && (!Entity2 || rel.to() === Entity2) && (!mapTo || mapTo === rel.mapTo));

    if (oneWay || mapTo)
      return t1Rels;

    // If the entities are the same then the user wants the relationships
    // between the table and itself, like a photo with a thumbnailID.  No need
    // to search the table twice and duplicate the relationship list.
    if (Entity1 === Entity2)
      return t1Rels;

    t2Rels = this.relMetadata
      .filter(rel => (!Entity2 || rel.Entity === Entity2) && rel.to() === Entity1);

    return t1Rels.concat(t2Rels);
  }

  /**
   * Get the relationship between two tables on a property.  Short-hand for
   * getRelationships with oneWay=true, but throws if the relationship does not
   * exist.
   * @param Entity1 - The first Entity (constructor), i.e. the class that's
   * decorated with @[[Table]].
   * @param Entity2 - The second Entity.
   * @param mapTo - The proeprty on Entity1 where the relationship is defined.
   * @return The RelationshipMetadata for the relationship.
   */
  getRelationship(
    Entity1: TableType,
    Entity2: TableType,
    mapTo: string): RelationshipMetadata {

    const rels = this.getRelationships(Entity1, Entity2, true, mapTo);

    assert(rels.length,
      `Relationship between "${Entity1.name}" and "${Entity2.name}" on property "${mapTo}" does not exist.`);

    return rels[0];
  }
}

