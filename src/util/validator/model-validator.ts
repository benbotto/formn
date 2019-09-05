import {
  ObjectValidator, Validator, StringValidator, MaxLengthValidator,
  IntValidator, NumberValidator, DateValidator, BooleanValidator,
  NotNullValidator, ValidationMetadata
} from 'bsy-validation';

import {
  metaFactory, ColumnMetadata, RelationshipMetadata
} from '../../metadata/';

import { SubModelTypeValidator, KeyValType } from '../';

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
   * [[Column]] and [[Relationship]] decoration, such as data type, maximum
   * length, and nullability.  If valid, then check any user-defined
   * validation, such as email and phone number validation.  (Reference the
   * bsy-validation package, as the ObjectValidator class is used for
   * validation.)
   * @param obj - The object to validate against class Entity.
   * @param Entity - A class that has properties decorated with @Validate.
   * This is the schema against which obj will be validated.
   */
  async validate(
    obj: object,
    Entity: {new(): any}): Promise<void> {

    // First check if obj is valid based on the ColumnMetadata (e.g. data type,
    // max length, etc.) and RelationshipMetadata using the custom
    // getValidationMetadata method.
    await super
      .validate(obj, Entity);

    // If the column- and relationship-level validation passes, that passes,
    // then validate the object using a standard ObjectValidator (i.e. any
    // custom validation added by a user, like email and phone checks).
    //
    // Note that objectValidator may be null (no chaining).
    if (this.objectValidator) {
      await this.objectValidator
        .validate(obj, Entity);
    }

    // Next, validate any sub-resources.
    const relMeta = metaFactory
      .getRelationshipStore()
      .getRelationships(Entity, null, true);

    for (let meta of relMeta) {
      if ((obj as KeyValType)[meta.mapTo]) {
        if (meta.cardinality === 'OneToMany') {
          const subResources = (obj as KeyValType)[meta.mapTo];

          for (let resource of subResources) {
            await this
              .validate(resource, meta.to());
          }
        }
        else {
          const subResource = (obj as KeyValType)[meta.mapTo];

          await this
            .validate(subResource, meta.to());
        }
      }
    }
  }

  /**
   * Generate validation metadata (see bsy-validation) for the Entity.
   */
  getValidationMetadata(Entity: {new(): any}): ValidationMetadata[] {
    // Column-level validation.
    const colMeta = metaFactory
      .getColumnStore()
      .getColumnMetadata(Entity);

    const colValMeta = colMeta
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


    // Relationship-level validation (e.g. checks that a sub-resource
    // is an array or an object, depending on the cardinality of the
    // relationship).
    const relMeta = metaFactory
      .getRelationshipStore()
      .getRelationships(Entity, null, true);

    const relValMeta = relMeta
      .map((meta: RelationshipMetadata) =>
        new ValidationMetadata(Entity, meta.mapTo,
          [new SubModelTypeValidator(meta.cardinality)]));;

    return colValMeta
      .concat(relValMeta)
  }
}

