import { CardinalityType } from './cardinality-type';
import { TableType } from '../table/table-type';
import { PropertyMapType } from '../property/property-map-type';

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
   * the names of the local and remote properties. E.g. (user, phoneNumber) =>
   * [user.id, phoneNumber.userID] (returns ['userID', 'phoneNumberID']).  The
   * function will be passed [[PropertyMapType]]s containing all the decorated
   * properties of Entity and RefEntity.  If the relationship between Entity
   * and RefEntity depends on multiple columns, then an array of arrays should
   * be returned.
   * @param cardinality - The relationship type (e.g. OneToMany).
   */
  constructor(
    public Entity: TableType,
    public mapTo: string,
    public to: () => TableType,
    public on: (entity: PropertyMapType, refEntity: PropertyMapType) => string[]|string[][],
    public cardinality: CardinalityType) {
  }
}

