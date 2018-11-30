import { CardinalityType } from './cardinality-type';
import { EntityType } from '../table/entity-type';

/** Represents a relationship between two tables. */
export class RelationshipMetadata {
  /**
   * Initialize the relationship metadata.
   * @param Entity - The type (constructor) of the table where this
   * relationship was defined.
   * @param mapTo - The property in Entity on which this relationship was
   * defined.
   * @param to - A function that, when called, returns the referenced
   * Entity type (constructor).
   * @param on - A function that, when called, returns an array consisting of
   * the names of the local and remote properties (e.g. [user.id,
   * phoneNumber.userID]).  The function will be passed property maps
   * containing all the decorated properties of Entity and RefEntity.
   * @param cardinality - The relationship type (e.g. OneToMany).
   */
  constructor(
    public Entity: EntityType,
    public mapTo: string,
    public to: () => EntityType,
    public on: (entity: any, refEntity: any) => string[],
    public cardinality: CardinalityType) {
  }
}

