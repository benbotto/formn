import { ParameterType } from './condition/parameter-type';

/**
 * A class that holds a SQL string (query) and any associated parameters.
 */
export class ExecutableQuery {
  /**
   * The SQL string to execute.
   */
  query: string;

  /**
   * Any parameters for replacement in the query string.
   */
  params: ParameterType;
}

