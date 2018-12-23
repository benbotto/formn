import { Converter } from '../../../converter/';

export class YesNoConverter extends Converter {
  onRetrieve(val: string): boolean {
    return val === 'YES';
  }
}

