import { ModelColumn } from '../';

/**
 * Interface for ColumnFormatters.  It's used during model generation to format
 * property names.
 */
export interface ColumnFormatter {
  /**
   * Given a [[ModelColumn]] instance, return the formatted property name.
   */
  formatPropertyName(column: ModelColumn): string;
}

