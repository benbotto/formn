import { Escaper } from './escaper';

/**
 * Helper class for escaping parts of a query under MSSQL.
 */
export class MSSQLEscaper extends Escaper {
  /**
   * Initialize the escaper.
   */
  constructor() {
    super();
  }

  /**
   * Escape a property, such as a table, column name, or alias.
   * @param {string} prop - The property to escape.
   * @return {string} The escaped property.
   */
  escapeProperty(prop: string): string {
    return `[${prop}]`;
  }
}

