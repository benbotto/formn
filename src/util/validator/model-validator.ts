import {
  ObjectValidator, Validator, StringValidator, MaxLengthValidator,
  IntValidator, NumberValidator, DateValidator, BooleanValidator,
  NotNullValidator, ValidationMetadata
} from 'bsy-validation';

import { metaFactory, ColumnMetadata } from '../../metadata/';

/**
 * A specialized ObjectValidator (from bsy-validation) that's used to validate
 * objects against Formn Entity metadata.
 */
export class ModelValidator extends ObjectValidator {
  /**
   * Initialize with an ObjectValidator instance.  This class decorates
   * ObjectValidator's validate method.
   */
  constructor(
    protected objectValidator: ObjectValidator = new ObjectValidator()) {
    super();
  }

  /**
   * Verify that each property of obj meets the requirements defined by
   * @[[Column]] decoration, such as data type, maximum length, and
   * nullability.  If valid, then check any user-defined validation, such as
   * email and phone number validation.  (Reference the bsy-validation package,
   * as the ObjectValidator class is used for validation.)
   * @param obj - The object to validate against class Entity.
   * @param Entity - A class that has properties decorated with @Validate.
   * This is the schema against which obj will be validated.
   */
  validate(
    obj: object,
    Entity: {new(): any}): Promise<void> {

    // First check if obj is valid based on the ColumnMetadata (e.g. data type,
    // max length, etc.) using the custom getValidationMetadata method.  If
    // that passes, then validate the object using a standard ObjectValidator
    // (i.e. any custom validation added by a user, like email and phone
    // checks).
    return super
      .validate(obj, Entity)
      .then(() => this.objectValidator.validate(obj, Entity));
  }

  /**
   * Generate [[ValidationMetadata]] for the Entity.
   */
  getValidationMetadata(Entity: {new(): any}): ValidationMetadata[] {
    const colMeta = metaFactory
      .getColumnStore()
      .getColumnMetadata(Entity);

    return colMeta
      .map((meta: ColumnMetadata) => {
        const validators: Validator[] = [];

        // Datatype validation.
        switch (meta.dataType) {
          case 'String':
            validators.push(new StringValidator());
            
            if (meta.maxLength !== undefined)
              validators.push(new MaxLengthValidator(meta.maxLength));
            break;

          case 'Date':
            validators.push(new DateValidator());
            break;

          case 'Number':
            switch (meta.sqlDataType) {
              case 'int':
              case 'smallint':
              case 'mediumint':
              case 'bigint':
                validators.push(new IntValidator());
                break;

              default:
                validators.push(new NumberValidator());
                break;
            }

            break;

          case 'Boolean':
            validators.push(new BooleanValidator());
            break;
        }

        // Null validation.
        if (meta.isNullable === false)
          validators.push(new NotNullValidator());

        return new ValidationMetadata(Entity, meta.mapTo, validators);
      });
  }
}

