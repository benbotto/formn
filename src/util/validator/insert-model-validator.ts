import {
  ObjectValidator, ValidationMetadata, Validator, DefinedValidator,
  UndefinedValidator
} from 'bsy-validation';

import { metaFactory, ColumnMetadata } from '../../metadata/';

import { ModelValidator } from '../';

/**
 * Specialized validator that's used to validate objects against a class's
 * validation schema and column metadata prior to creation.  For example, when
 * inserting a record non-nullable fields must be defined and non-null, and
 * generated fields, like auto-incrementing primary keys, must not be defined.
 * This differs from mutation (updating and deleting).
 */
export class InsertModelValidator extends ModelValidator {
  /**
   * Initialize with a [[ModelValidator]] instance.  The [[ModelValidator]]
   * handles the majority of the validation, while this class is concerned with
   * verifying the presence of non-nullable columns.
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

        // A non-nullable column is required in insert unless the column has a
        // default or is generated.  Generated columns, like auto-incrementing
        // primary keys, cannot be set manually on insert.
        if (meta.isGenerated)
          validators.push(new UndefinedValidator());
        else if (!meta.isNullable && !meta.hasDefault)
          validators.push(new DefinedValidator());

        return new ValidationMetadata(Entity, meta.mapTo, validators);
      });
  }
}

