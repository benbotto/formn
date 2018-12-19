import { ColumnStore, TableStore, RelationshipStore, PropertyMapStore,
  EntityType } from '../../metadata/';

import { assert } from '../../error/';

import { From, MutateModel, Escaper, Executer, Delete } from '../';

/**
 * A class for deleting models by ID.
 */
export class DeleteModel<T> extends MutateModel<Delete, T> {
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
   * @param Entity - The type of model to delete, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to delete, which must have the primary
   * key set.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: Escaper,
    protected executer: Executer,
    protected Entity: EntityType<T>,
    protected model: T) {

    super(colStore, tblStore, relStore, propStore, escaper, executer, Entity, model);
  }

  /**
   * Produce a [[Delete]] instance.
   * @param from - A [[From]] instance, passed to the [[Delete]] constructor.
   */
  protected produceQuery(from: From): Delete {
    return new Delete(this.colStore, this.tblStore, this.relStore, this.propStore, this.escaper,
      this.executer, from);
  }

  /**
   * Execute the query.
   * @return A promise that shall be resolved with the deleted model.
   */
  execute(): Promise<T> {
    const exe = this.buildQuery();

    return this.executer
      .delete(exe.query, exe.params)
      .then(res => {
        assert(res.affectedRows !== 0, 'Delete operation did not affect any rows.')

        return this.model;
      });
  }
}

