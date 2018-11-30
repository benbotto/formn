/**
 * A converter is used to transform a Column-decorated property on save or
 * retrieve.  For example, formatting dates to and from ISO8601.
 */
export class Converter {
  /**
   * Identity converter on retrieve.
   */
  onRetrieve(val: any): any {
    return val;
  }

  /**
   * Identity converter on save.
   */
  onSave(val: any): any {
    return val;
  }
}

