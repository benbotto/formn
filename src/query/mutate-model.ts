import { assert } from '../error/assert';

import { ColumnStore } from '../metadata/column/column-store';
import { TableStore } from '../metadata/table/table-store';
import { RelationshipStore } from '../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../metadata/property/property-map-store';
import { EntityType } from '../metadata/table/entity-type';

import { ParameterList } from './condition/parameter-list';
import { ParameterType } from './condition/parameter-type';
import { Query } from './query';
import { Escaper } from './escaper/escaper';
import { Executer } from './executer/executer';
import { From } from './from/from';
import { ExecutableQuery } from './executable-query';

/**
 * A [[Query]] that represents a mutation (update or delete) on an entity by
 * ID.
 */
export abstract class MutateModel<Q extends Query, T> extends Query {
  /**
   * A [[From]] instance that is used to create a [[Query]] of type Q.
   */
  protected from: From;

  /**
   * A [[Query]] instance (e.g. [[Update]] or [[Delete]] that is used in
   * toString, buildQuery, and execute.
   */
  protected query: Q;

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
   * @param Entity - The type of model to mutate, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to mutate, which must have the primary
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

    super(colStore, tblStore, relStore, propStore, escaper, executer);

    this.from = this.createFrom();
    this.query = this.produceQuery(this.from);
  }

  /**
   * Create the [[From]] instance that will be used when mutating the model.
   */
  private createFrom(): From {
    // Update is From the Entity table.
    const from = new From(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.escaper, this.Entity);
    const fromTblAlias = from.getBaseTableMeta().alias;

    // Update is by primary key: add the where clause.
    const pkColMetas = this.colStore.getPrimaryKey(this.Entity);
    const cond: any  = {$and: []};
    const paramList  = new ParameterList();

    pkColMetas
      .forEach(pkColMeta => {
        const pkVal     = (this.model as ParameterType)[pkColMeta.mapTo];
        const fqProp    = `${fromTblAlias}.${pkColMeta.mapTo}`;
        const paramName = paramList.createParameterName(fqProp);

        assert(pkVal !== undefined && pkVal !== null,
          `The primary key is required when mutating a model, but "${pkColMeta.mapTo}" is missing.`);

        paramList.addParameter(paramName, pkVal);
        cond.$and.push({$eq: {[fqProp]: `:${paramName}`}});
      });

    from
      .where(cond, paramList.getParams());

    return from;
  }

  /**
   * Produce a [[Query]] instance that's appropriate for the database (e.g. a
   * [[MySQLUpdate]]).
   * @param from - A [[From]] instance, passed to the [[Query]] constructor.
   */
  protected abstract produceQuery(from: From): Q;

  /**
   * Get the SQL that represents the query.
   * @return The SQL representing the mutation.
   */
  toString(): string {
    return this.query.toString();
  }

  /**
   * Build the query.
   * @return The string-representation of the query to execute along with query
   * parameters.
   */
  buildQuery(): ExecutableQuery {
    return this.query.buildQuery();
  }
}

