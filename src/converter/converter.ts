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

