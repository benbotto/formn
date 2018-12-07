import { ColumnStore } from '../metadata/column/column-store';
import { TableStore } from '../metadata/table/table-store';
import { RelationshipStore } from '../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../metadata/property/property-map-store';

import { Escaper } from './escaper/escaper';
import { Executer } from './executer/executer';
import { ExecutableQuery } from './executable-query';

/**
 * Base class for Queries (Select, Insert, Delete, Update).
 */
export abstract class Query {
  /**
   * Initialize the query.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]].  Used when escaping column names in
   * compiled conditions.
   * @param executer - An Executer instance that matches the database type
   * (e.g. [[MySQLExecuter]]).
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: Escaper,
    protected executer: Executer) {
  }

  /**
   * Convert the query to a string.
   * @return The SQL string.
   */
  abstract toString(): string;

  /**
   * Build the query.
   * @return An ExecutableQuery instance with a query sting and parameters.
   */
  abstract buildQuery(): ExecutableQuery;

  /**
   * Execute the query and return the results.
   * @param exe An ExecutableQuery instance with a query string and parameters.
   */
  abstract execute(exe: ExecutableQuery): any;
}

