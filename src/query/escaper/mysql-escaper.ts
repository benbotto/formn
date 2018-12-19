import { Escaper } from '../';

/**
 * Helper class for escaping parts of a query under MySQL.
 */
export class MySQLEscaper extends Escaper {
  /**
   * Initialize the escaper.
   */
  constructor() {
    super();
  }

  /**
   * Escape a property, such as a table, column name, or alias, using
   * backticks.
   * @param prop - The property to escape.
   * @return The escaped property.
   */
  escapeProperty(prop: string): string {
    return `\`${prop}\``;
  }
}

