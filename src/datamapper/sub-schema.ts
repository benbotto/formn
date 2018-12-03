import { Schema } from './schema';
import { RelationshipMetadata } from '../metadata/relationship/relationship-metadata';

/**
 * This class is used within [[Schema]] to represent a sub schema, which is a
 * mapping definition (a [[Schema]] instance) and relationship information
 * ([[RelationshipMetadata]]).
 */
export class SubSchema {
  /**
   * Initialize the SubSchema.
   * @param schema - A Schema instance for data mapping.
   * @param relationship - Metadata about the relationship from the parent [[Schema]]
   * to the child.
   */
  constructor(
    public schema: Schema,
    public relationship: RelationshipMetadata) {
  }
}

