import { ColumnStore, TableStore, RelationshipStore, PropertyMapStore,
  ColumnMetadata, EntityType } from '../../metadata/';

import { Escaper, Executer, From, Select, Delete, Update, UpdateType } from '../';

/**
 * Adapter for the [[From]] class that exposes a nice user interface for
 * [[Select]], [[Delete]], and [[Update]], all of which depend on a [[From]]
 * instance.
 */
export abstract class FromAdapter<T> extends From {
  /**
   * Initialize the From instance.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]]).  Used when escaping column names in
   * compiled conditions.
   * @param executer - An [[Executer]] instance that matches the database type
   * (e.g. [[MySQLExecuter]]).
   * @param FromEntity - Constructor of the FROM table.
   * @param fromAlias - Alias for the FROM table, used in conditions, joins,
   * and column selection.  Optional: defaults to the name of the table.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: Escaper,
    protected executer: Executer,
    FromEntity: EntityType<T>,
    fromAlias?: string) {

    super(colStore, tblStore, relStore, propStore, escaper, FromEntity, fromAlias);
  }

  /**
   * Select from the table.  See [[Select.select]].
   * @param cols - An optional set of columns to select.
   * @return An executable [[Select]] instance.
   */
  abstract select(...cols: string[]): Select<T>;

  /**
   * Delete from a table.  See [[Delete]].
   * @param alias - The unique alias of the table from which
   * records will be deleted.  Optional, defaults to the alias of the from
   * table.
   * @return A Delete instance that can be executed.
   */
  delete(alias?: string): Delete {
    return new Delete(this.escaper, this.executer, this, alias);
  }

  /**
   * Update a table.  See [[Update]].
   * @param model - The model describing what to update.
   * @return An [[Update]] instance matching the database type (e.g.
   * [[MySQLUpdate]]).
   */
  abstract update(model: UpdateType): Update;
}

