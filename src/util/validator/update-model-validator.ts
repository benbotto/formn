import {
  ObjectValidator, ValidationMetadata, Validator, DefinedValidator,
  NotNullValidator
} from 'bsy-validation';

import { metaFactory, ColumnMetadata } from '../../metadata/';

import { ModelValidator } from '../';

/**
 * This class validates an object against a class's validation metadata prior
 * to updating by verifying that the primary key is present, and then running
 * the object through a [[ModelValidator]] instance.  Reference
 * [[ModelValidator]] and the bsy-validation package.
 */
export class UpdateModelValidator extends ModelValidator {
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

        // The PK must be defined.
        if (meta.isPrimary)
          validators.push(new DefinedValidator());

        // If the PK is not nullable then the underlying ModelValidator will
        // handle the null check.  If it is a nullable column, it's still
        // required when updating, so add a null check.
        if (meta.isNullable)
          validators.push(new NotNullValidator());

        return new ValidationMetadata(Entity, meta.mapTo, validators);
      });
  }
}
