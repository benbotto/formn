import { assert } from '../../error/assert';

import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { EntityType } from '../../metadata/table/entity-type';

import { ParameterList } from '../condition/parameter-list';
import { Escaper } from '../escaper/escaper';
import { Executer } from '../executer/executer';
import { From } from '../from/from';
import { UpdateType } from './update-type';
import { MutateModel } from '../mutate-model';
import { Update } from './update';

/**
 * A [[Query]] that represents an UPDATE query and is used for updating an
 * entity.
 */
export abstract class UpdateModel<T> extends MutateModel<Update, T> {
  /**
   * Initialize the query using an Entity type and an Entity instance (a
   * model).
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
    protected escaper: Escaper,
    protected executer: Executer,
    protected Entity: EntityType,
    protected model: T) {

    super(colStore, tblStore, relStore, propStore, escaper, executer, Entity, model);
  }

  /**
   * Create a model that is suitable for use with an [[Update]] query.
   * This should be called from a child class's produceQuery method.
   */
  protected createUpdateModel(from: From): UpdateType {
    const fromMeta      = from.getFromMeta();
    const fromTblAlias  = from.getBaseTableMeta().alias;
    const availableCols = fromMeta.getFromColumnMeta();
    const updateModel: UpdateType = {};
    const pkProps = this.colStore
      .getPrimaryKey(this.Entity)
      .map(pkMeta => pkMeta.mapTo);

    availableCols
      .forEach(fromColMeta => {
        const modelProp = fromColMeta.columnMetadata.mapTo;
        const modelVal  = (this.model as UpdateType)[modelProp];

        // Don't update the primary key.
        if (pkProps.indexOf(modelProp) !== -1)
          return;

        // Model value of null is fine here because it means to set the value
        // to NULL in the db.
        if (modelVal !== undefined) {
          updateModel[`${fromTblAlias}.${modelProp}`] = modelVal;
        }
      });

    return updateModel;
  }

  /**
   * Produce an [[Update]] instance that's appropriate for the database (e.g. a
   * [[MySQLUpdate]]).
   * @param from - A [[From]] instance, passed to the [[Update]] constructor.
   * @param updateModel - An updatable model, passed to the [[Update]]
   * constructor.
   */
  protected abstract produceQuery(from: From): Update;

  /**
   * Execute the query.
   * @return A promise that shall be resolved with the mutated model.
   */
  execute(): Promise<T> {
    const exe = this.buildQuery();

    if (exe.query === '')
      return Promise.resolve(this.model);

    return this.executer
      .update(exe.query, exe.params)
      .then(res => {
        assert(res.affectedRows !== 0, 'Update operation did not affect any rows.')

        return this.model;
      });
  }
}

