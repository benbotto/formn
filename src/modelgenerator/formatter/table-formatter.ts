import { ModelTable } from '../';

/**
 * Interface for TableFormatters.  It's used during model generation to format
 * class and entity names.
 */
export interface TableFormatter {
  /**
   * Given a [[ModelTable]] instance, return the formatted class name.
   */
  formatClassName(table: ModelTable): string;

  /**
   * Given a [[ModelTable]] instance, return the formatted import name.
   */
  formatImportName(table: ModelTable): string;
}

