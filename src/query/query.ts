import { ColumnStore, TableStore, RelationshipStore, PropertyMapStore } from '../metadata/';

import { Escaper, Executer, ExecutableQuery } from './';

/**
 * Base class for Queries (Select, Insert, Delete, Update).
 */
export abstract class Query {
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
  abstract execute(exe: ExecutableQuery): Promise<any>;
}

