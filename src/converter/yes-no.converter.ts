import { Converter } from './';

export class YesNoConverter extends Converter {
  /**
   * Convert the string value to true if it's "yes", otherwise false.
   */
  onRetrieve(val: string): boolean {
    return val.toLowerCase() === 'yes';
  }

  /**
   * Convert the boolean to "YES" or "NO."
   */
  onSave(val: boolean|any): string {
    return val === true ? 'YES' : 'NO';
  }
}

