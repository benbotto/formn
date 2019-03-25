import {
  ObjectValidator, ValidationMetadata, Validator, DefinedValidator
} from 'bsy-validation';

import { metaFactory, ColumnMetadata } from '../../metadata/';

import { ModelValidator } from '../';

/**
 * This class validates an object against a class's validation metadata prior
 * to updating.  Reference [[ModelValidator]] and the bsy-validation package.
 */
export class UpdateValidator extends ModelValidator {
  /**
   * Initialize with a [[ModelValidator]] instance.  The [[ModelValidator]] is
   * used to verify that objects meet their class's column metadata (data type,
   * nullability, etc.), and any custom validation.
   */
  constructor(
    protected objectValidator: ObjectValidator = new ModelValidator()) {

    super(objectValidator);
  }


  /**
   * Generate validation metadata (see bsy-validation) for the Entity.
   */
  getValidationMetadata(Entity: {new(): any}): ValidationMetadata[] {
    const colMeta = metaFactory
      .getColumnStore()
      .getColumnMetadata(Entity);

    return colMeta
      .map((meta: ColumnMetadata) => {
        const validators: Validator[] = [];

        if (meta.isPrimary)
          validators.push(new DefinedValidator());

        return new ValidationMetadata(Entity, meta.mapTo, validators);
      });
  }
}
