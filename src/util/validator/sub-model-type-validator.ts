import { Validator } from 'bsy-validation';

import { CardinalityType } from '../../metadata';

/**
 * Validator that checks the type of a sub-model (a related model) to be either
 * an array or an object, depending on the cardinality of the relationship.
 */
export class SubModelTypeValidator {
  /**
   * Initialize the validator with the cardinality of the parent-to-child
   * cardinality.
   */
  constructor(private cardinality: CardinalityType) {
  }

  /**
   * Helper method to check if something is an "object" (loosely speaking).
   * The "object" cannot be null (null is an object) or an array.
   */
  private isObject(val: any): boolean {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  /**
   * Checks that a value is an array or an object, depending on the
   * cardinality.
   */
  validate(val: any): boolean {
    // Undefined values are skipped.
    if (val === undefined)
      return true;

    if (this.cardinality === 'OneToMany') {
      // The sub-resource must be an array.  Null is invalid in the OneToMany
      // case.
      if (val === null || !Array.isArray(val))
        return false;

      // Each element of the array must be an object.
      return val
        .every(ele => this.isObject(ele));
    }
    else {
      // In the *ToOne case, null is valid.
      return val === null || this.isObject(val);
    }
  }

  /**
   * Describe why the value is invalid.
   */
  getErrorMessage(propName: string): string {
    if (this.cardinality === 'OneToMany')
      return `"${propName}" must be a valid array.`;
    else
      return `"${propName}" must be a valid object.`;
  }
}
