import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { ColumnMetadata } from '../../metadata/column/column-metadata';
import { EntityType } from '../../metadata/table/entity-type';

import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';
import { FromAdapter } from './from-adapter';
import { UpdateType } from '../update/update-type';
import { MySQLUpdate } from '../update/mysql-update';

/**
 * A specialized [[FromAdapter]] for MySQL databases.  See [[FromAdapter]].
 */
export class MySQLFromAdapter extends FromAdapter {
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
    FromEntity: EntityType,
    fromAlias?: string) {

    super(colStore, tblStore, relStore, propStore, escaper, executer, FromEntity, fromAlias);
  }

  /**
   * Update a table.  See [[MySQLUpdate]].
   * @param model - The model describing what to update.
   * @return A [[MySQLUpdate]] instance that is executable.
   */
  update(model: UpdateType): MySQLUpdate {
    return new MySQLUpdate(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.escaper, this.executer, this, model);
  }
}

