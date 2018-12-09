import { Converter } from '../../converter/converter';

/**
 * Helper class used when testing.  Converts a value to uppercase on save and
 * retrieve.
 */
export class UCConverter extends Converter {
  onSave(val: string): string {
    return val.toUpperCase();
  }

  onRetrieve(val: string): string {
    return val.toUpperCase();
  }
}

