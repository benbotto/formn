import { Converter } from '../../../converter/';

export class HasDefaultConverter extends Converter {
  onRetrieve(val: string): boolean {
    return val !== null;
  }
}
