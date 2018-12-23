import { Converter } from '../../../converter/';

export class IsPrimaryConverter extends Converter {
  onRetrieve(val: string): boolean {
    return val === 'PRI';
  }
}

