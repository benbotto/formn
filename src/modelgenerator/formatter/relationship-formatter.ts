import { ModelRelationship } from '../';

/**
 * Interface for RelationshipFormatters.  It's used during model generation to format
 * property names of relationships.
 */
export interface RelationshipFormatter {
  /**
   * Given a [[ModelRelationship]] instance, return the formatted property name.
   */
  formatPropertyName(column: ModelRelationship): string;
}
