import metaFactory from '../metadata/metadata-factory';

import { ColumnStore } from '../metadata/column/column-store';
import { TableStore } from '../metadata/table/table-store';
import { RelationshipStore } from '../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../metadata/property/property-map-store';
import { EntityType } from '../metadata/table/entity-type';

import { ConnectionOptions } from './connection-options';

import { Executer } from '../query/executer/executer';
import { Escaper } from '../query/escaper/escaper';
import { Insert } from '../query/insert/insert';
import { FromAdapter } from '../query/from/from-adapter';
import { UpdateModel } from '../query/update/update-model';
import { DeleteModel } from '../query/delete/delete-model';

/** 
 * This is the main interface to the ORM.  It provides access to CRUD
 * operations and connection management.
 */
export abstract class DataContext {
  protected colStore: ColumnStore;
  protected tblStore: TableStore;
  protected relStore: RelationshipStore;
  protected propStore: PropertyMapStore;

  /**
   * Initialize the DataContext with connection options.
   * @param connOpts - Connection options for setting up a connection to the
   * database.
   */
  constructor(protected connOpts: ConnectionOptions) {
    // These stores contain metadata about the database (tables, columns,
    // etc.).  All the metadata come from decoractors.
    this.tblStore  = metaFactory.getTableStore();
    this.colStore  = metaFactory.getColumnStore();
    this.relStore  = metaFactory.getRelationshipStore();
    this.propStore = metaFactory.getPropertyMapStore();
  }

  /**
   * Get an [[Executer]] instance for the database (e.g. [[MySQLExecuter]]).
   */
  abstract getExecuter(): Executer;

  /**
   * Get an [[Escaper]] instance for the database (e.g. [[MySQLEscaper]]).
   */
  abstract getEscaper(): Escaper;

  /**
   * Create and return a new [[Insert]] instance.
   * @param Entity - The type of model to insert, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to insert.
   * @return An [[Insert]] instance that can be executed using
   * [[Insert.execute]].
   */
  insert<T>(Entity: EntityType, model: T): Insert<T> {
    return new Insert<T>(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.getEscaper(), this.getExecuter(), Entity, model);
  }

  /**
   * Create a new [[FromAdapter]] instance, which can then be used to
   * select, update, or delete.
   * @param Entity - A [[Table]]-decorated entity which is the constructor of
   * the FROM table.
   * @param alias - Alias for the FROM table, used in conditions, joins,
   * and column selection.  Optional: defaults to the name of the table.
   * @return A [[FromAdapter]] that implements [[FromAdapter.select]],
   * [[FromAdapter.update]], and [[FromAdapter.delete]].
   */
  abstract from(Entity: EntityType, alias: string): FromAdapter;

  /**
   * Create a new [[UpdateModel]] instance that can be used to update a model
   * by ID.  For complex update operations, use the [[DataContext.from]] method
   * to obtain a [[FromAdapter]] instance, and then call [[FromAdapter.update]]
   * on that instance.
   * @param Entity - The type of model to update, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to update, which must have the primary
   * key set.
   * @return An [[UpdateModel]] instance that can be executed using
   * [[UpdateModel.execute]].
   */
  abstract update<T>(Entity: EntityType, model: T): UpdateModel<T>;

  /**
   * Create a new [[DeleteModel]] instance that can be used to delete a model
   * by ID.  For complex delete operations, use the [[DataContext.from]] method
   * to obtain a [[FromAdapter]] instance, and then call [[FromAdapter.delete]]
   * on that instance.
   * @param Entity - The type of model to delete, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to delete, which must have the primary
   * key set.
   * @return A [[DeleteModel]] instance that can be executed using
   * [[DeleteModel.execute]].
   */
  delete<T>(Entity: EntityType, model: T): DeleteModel<T> {
    return new DeleteModel(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.getEscaper(), this.getExecuter(), Entity, model);
  }

  /**
   * End the connection.
   */
  abstract end(): void;
}

