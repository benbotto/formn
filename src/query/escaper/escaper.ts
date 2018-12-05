/** Helper class for escaping parts of a query. */
export abstract class Escaper {
  /**
   * Escape a property, such as a table, column name, or alias.
   * @param prop - The property to escape.
   * @return The escaped property as a string.
   */
  abstract escapeProperty(prop: string): string;

  /**
   * Escape a fully-qualified column name, such as 'u.firstName' or
   * 'phone_numbers.phoneNumber'.
   * @param fqc - The fully-qualified column.
   * @return The escaped column name.
   */
  escapeFullyQualifiedColumn(fqc: string): string {
    const firstDot = fqc.indexOf('.');
    
    // There is no dot, it's just a column name.
    if (firstDot === -1)
      return this.escapeProperty(fqc);

    // Get the table and column parts and escape each individually.
    const tbl = this.escapeProperty(fqc.substring(0, firstDot));
    const col = this.escapeProperty(fqc.substring(firstDot + 1));

    return `${tbl}.${col}`;
  }
}

