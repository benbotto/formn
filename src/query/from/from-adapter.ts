import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { ColumnMetadata } from '../../metadata/column/column-metadata';
import { TableType } from '../../metadata/table/table-type';

import { Escaper } from '../escaper/escaper';
import { Executer } from '../executer/executer';

import { From} from './from';
import { Select } from '../select/select';
import { Delete } from '../delete/delete';
import { Update } from '../update/update';
import { UpdateType } from '../update/update-type';

/**
 * Adapter for the [[From]] class that exposes a nice user interface for
 * [[Select]], [[Delete]], and [[Update]], all of which depend on a [[From]]
 * instance.
 */
export abstract class FromAdapter extends From {
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
    FromEntity: TableType,
    fromAlias?: string) {

    super(colStore, tblStore, relStore, propStore, escaper, FromEntity, fromAlias);
  }

  /**
   * Select from the table.  See [[Select.select]].
   * @param cols - An optional set of columns to select.
   * @return An executable [[Select]] instance.
   */
  select<T>(...cols: string[]): Select<T> {
    return new Select<T>(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.escaper, this.executer, this)
      .select(...cols);
  }

  /**
   * Delete from a table.  See [[Delete]].
   * @param alias - The unique alias of the table from which
   * records will be deleted.  Optional, defaults to the alias of the from
   * table.
   * @return A Delete instance that can be executed.
   */
  delete(alias?: string): Delete {
    return new Delete(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.escaper, this.executer, this, alias)
  }

  /**
   * Update a table.  See [[Update]].
   * @param model - The model describing what to update.
   * @return An [[Update]] instance matching the database type (e.g.
   * [[MySQLUpdate]]).
   */
  abstract update(model: UpdateType): Update;
}

