import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { EntityType } from '../../metadata/table/entity-type';

import { From } from '../from/from';
import { UpdateType } from './update-type';
import { UpdateModel } from './update-model';
import { MySQLUpdate } from './mysql-update';
import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';

/**
 * An [[UpdateModel]] class for MySQL.
 */
export class MySQLUpdateModel<T> extends UpdateModel<T> {
  /**
   * Initialize the query using an Entity type and an Entity instance (a
   * model).
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - A [[MySQLEscaper]] instance.  Used when escaping column
   * names in compiled conditions.
   * @param executer - A [[MySQLExecuter]] instance for executing queries.
   * @param Entity - The type of model to update, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to update, which must have the primary
   * key set.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: MySQLEscaper,
    protected executer: MySQLExecuter,
    protected Entity: EntityType,
    protected model: T) {

    super(colStore, tblStore, relStore, propStore, escaper, executer, Entity, model);
  }

  /**
   * Produce a [[MySQLUpdate]] instance using the [[From]] instance and the
   * update model created from createUpdateModel.
   * @param from - A [[From]] instance, passed to the [[MySQLUpdate]] constructor.
   * constructor.
   */
  protected produceQuery(from: From): MySQLUpdate {
    const updateModel = this.createUpdateModel(from);

    return new MySQLUpdate(this.colStore, this.tblStore, this.relStore, this.propStore, this.escaper,
      this.executer, from, updateModel);
  }
}

