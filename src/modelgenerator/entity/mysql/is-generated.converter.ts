import { Converter } from '../../../converter/';

export class IsGeneratedConverter extends Converter {
  onRetrieve(val: string): boolean {
    return val === 'auto_increment';
  }
}

