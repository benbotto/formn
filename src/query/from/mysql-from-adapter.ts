import { ColumnStore, TableStore, RelationshipStore, PropertyMapStore,
  ColumnMetadata, EntityType } from '../../metadata/';

import {MySQLEscaper, MySQLExecuter, FromAdapter, UpdateType, MySQLUpdate,
  Select, MySQLSelect, OrderBy } from '../';

/**
 * A specialized [[FromAdapter]] for MySQL databases.  See [[FromAdapter]].
 */
export class MySQLFromAdapter<T> extends FromAdapter<T> {
  /**
   * Initialize the From instance.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - An [[Escaper]] for MySQL.  Used when escaping column
   * names.
   * @param executer - An [[Executer]] instance for MySQL.
   * @param FromEntity - Constructor of the FROM table.
   * @param fromAlias - Alias for the FROM table, used in conditions, joins,
   * and column selection.  Optional: defaults to the name of the table.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: MySQLEscaper,
    protected executer: MySQLExecuter,
    FromEntity: EntityType<T>,
    fromAlias?: string) {

    super(colStore, tblStore, relStore, propStore, escaper, executer, FromEntity, fromAlias);
  }

  /**
   * Select from the table.  See [[Select.select]].
   * @param cols - An optional set of columns to select.
   * @return An executable [[Select]] instance.
   */
  select(...cols: string[]): MySQLSelect<T> {
    const order = new OrderBy(this.escaper, this);

    return new MySQLSelect<T>(this.colStore, this.escaper, this.executer, this, order)
      .select(...cols);
  }

  /**
   * Select distinct from the table.  See [[Select.select]].
   * @param cols - An optional set of columns to select.
   * @return An executable [[Select]] instance.
   */
  selectDistinct(...cols: string[]): MySQLSelect<T> {
    return this.select(...cols)
      .distinct();
  }

  /**
   * Update a table.  See [[MySQLUpdate]].
   * @param model - The model describing what to update.
   * @return A [[MySQLUpdate]] instance that is executable.
   */
  update(model: UpdateType): MySQLUpdate {
    return new MySQLUpdate(this.escaper, this.executer, this, model);
  }
}

