import { singular } from 'pluralize';
import { pascalCase, paramCase as kebabCase } from 'change-case';

import { TableFormatter, ModelTable } from '../';

/**
 * Default [[TableFormatter]] that formats class and import names.
 */
export class DefaultTableFormatter implements TableFormatter {
  /**
   * Given a [[ModelTable]] instance, convert the table name to singular and
   * pascal case.
   */
  formatClassName(table: ModelTable): string {
    return pascalCase(singular(table.getName()));
  }

  /**
   * Given a [[ModelTable]] instance, convert the formatted class name to kebab
   * case and append ".entity."
   */
  formatImportName(table: ModelTable): string {
    const className = this.formatClassName(table);

    return kebabCase(className) + '.entity';
  }
}

