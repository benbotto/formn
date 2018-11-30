import { RelationshipMetadata } from './relationship-metadata';
import { EntityType } from '../table/entity-type';

/** Stores relationships and provides lookup functions. */
export class RelationshipStore {
  private relMetadata: RelationshipMetadata[] = [];

  /**
   * Add a relationship.
   */
  addRelationshipMetadata(rel: RelationshipMetadata): RelationshipStore {
    this.relMetadata.push(rel);

    return this;
  }

  /**
   * Get all of the relationships between two tables.
   * @param Entity1 - The first Entity (constructor), i.e. the class that's
   * decorated with @Table.
   * @param Entity2 - The second Entity.
   * @param oneWay - When true, only return the relationships between Entity1
   * and Entity2 that Entity1 owns.
   * @param mapTo - An optional property on Entity1.  If passed, return the
   * relationship for this property only (implies oneWay).
   * @return An array of RelationshipMetadata instances.
   */
  getRelationships(
    Entity1: EntityType,
    Entity2: EntityType,
    oneWay = false,
    mapTo: string = null): RelationshipMetadata[] {

    let t1Rels, t2Rels;

    t1Rels = this.relMetadata
      .filter(rel => rel.Entity === Entity1 && rel.to() === Entity2 && (!mapTo || mapTo === rel.mapTo));

    if (oneWay || mapTo)
      return t1Rels;

    // If the entities are the same then the user wants the relationships
    // between the table and itself, like a photo with a thumbnailID.  No need
    // to search the table twice and duplicate the relationship list.
    if (Entity1 === Entity2)
      return t1Rels;

    t2Rels = this.relMetadata
      .filter(rel => rel.Entity === Entity2 && rel.to() === Entity1);

    return t1Rels.concat(t2Rels);
  }
}

