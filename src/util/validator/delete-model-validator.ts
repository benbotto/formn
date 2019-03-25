import {
  ObjectValidator, ValidationMetadata, Validator, DefinedValidator,
  NotNullValidator
} from 'bsy-validation';

import { metaFactory, ColumnMetadata } from '../../metadata/';

import { ModelValidator } from '../';

/**
 * This class is used to validate an object against a class's validation
 * metadata prior to deletion.  When deleting, the primary key is required to
 * be present and valid, but all other validation is ignored.  Reference
 * [[ModelValidator]] and the bsy-validation package.
 */
export class DeleteModelValidator extends ModelValidator {
  /**
   * Initialize the validator.
   */
  constructor() {
    // There's no validation chaining in this class.  When deleting, only the
    // PK columns are checked.
    super(null);
  }

  /**
   * Generate validation metadata (see bsy-validation) for the Entity.  The
   * returned metadata is only for the primary key column(s).
   */
  getValidationMetadata(Entity: {new(): any}): ValidationMetadata[] {
    // Column metadata for the primary key column(s).
    const colMeta = metaFactory
      .getColumnStore()
      .getColumnMetadata(Entity)
      .filter(meta => meta.isPrimary);

    // ValidationMetadata from the parent ModelValidator class.  All columns
    // except for the PK columns will be stripped.
    const parentValMeta = super
      .getValidationMetadata(Entity);

    return colMeta
      .map((meta: ColumnMetadata) => {
        const validators: Validator[] = [];

        // The PK must be defined.
        validators.push(new DefinedValidator());

        // If the PK is not nullable then the underlying ModelValidator will
        // handle the null check.  If it is a nullable column, it's still
        // required when updating, so add a null check.
        if (meta.isNullable)
          validators.push(new NotNullValidator());

        // Push on the parent validators (data type checks and such).
        validators
          .push(...parentValMeta
            .filter(valMeta => valMeta.propName === meta.mapTo)[0]
            .validators);

        return new ValidationMetadata(Entity, meta.mapTo, validators);
      });
  }
}

