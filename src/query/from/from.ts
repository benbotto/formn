import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { Escaper } from '../escaper/escaper';
import { EntityType } from '../../metadata/table/entity-type';

/**
 * Represents the FROM portion of a query, with any JOINs and optionally a
 * WHERE condition.  This class is used when selecting, updating, or deleting.
 */
export class From {
  /**
   * Initialize.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]].  Used when escaping column names in
   * compiled conditions.
   * @param FromEntity - Constructor of the FROM table.
   * @param fromAlias - Alias for the FROM table, used in conditions, joins,
   * and column selection.  Optional: defaults to the name of the table.
   */
  constructor(
    private colStore: ColumnStore,
    private tblStore: TableStore,
    private relStore: RelationshipStore,
    private propStore: PropertyMapStore,
    private escaper: Escaper,
    FromEntity: EntityType,
    fromAlias?: string) {
  }
}

