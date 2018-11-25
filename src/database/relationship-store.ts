import { ForeignKeyMetadata } from './foreign-key-metadata';

/** Stores foreign key relationships and provides lookup functions. */
export class RelationshipStore {
  private fkMetaData: ForeignKeyMetadata[] = [];

  /**
   * Init.
   */
  constructor() {
  }

  /**
   * Add a foreign key and index it by Entity type.
   */
  addForeignKeyMetadata(fk: ForeignKeyMetadata): RelationshipStore {
    this.fkMetaData.push(fk);

    return this;
  }

  /**
   * Get all of the foreign keys between two tables.  The order of the two
   * table names does not matter.
   * @param Entity1 - The first Entity (constructor), i.e. the class that's
   * decorated with @Table.
   * @param Entity2 - The second Entity.
   * @param oneWay - When true, only return the relationships between Entity1
   * and Entity2 that Entity1 owns.
   * @return An array of ForeignKeyMetadata instances.
   */
  getRelationships(Entity1: {new(): any}, Entity2: {new(): any}, oneWay = false): ForeignKeyMetadata[] {
    let t1Rels, t2Rels;

    t1Rels = this.fkMetaData
      .filter(fk => fk.Entity === Entity1 && fk.getRefEntity() === Entity2);

    if (oneWay)
      return t1Rels;

    // If the entities are the same then the user wants the relationships
    // between the table and itself, like a photo with a thumbnailID.  No need
    // to search the table twice and duplicate the relationship list.
    if (Entity1 === Entity2)
      return t1Rels;

    t2Rels = this.fkMetaData
      .filter(fk => fk.Entity === Entity2 && fk.getRefEntity() === Entity1);

    return t1Rels.concat(t2Rels);
  }
}

