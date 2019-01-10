import { singular } from 'pluralize';
import { camelCase }  from 'change-case';

import { ColumnFormatter, ModelColumn } from '../';

/**
 * Default [[ColumnFormatter]] that formats property names.
 */
export class DefaultColumnFormatter implements ColumnFormatter {
  /**
   * Given a [[ModelColumn]] instance, return the formatted property name.  If
   * the column is primary and generated then "id" shall be returned;
   * otherwise, convert the column name to camel case.
   */
  formatPropertyName(column: ModelColumn): string {
    if (column.getIsPrimary() && column.getIsGenerated())
      return 'id';

    return camelCase(column.getName());
  }
}

