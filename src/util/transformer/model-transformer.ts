import { EntityType, metaFactory } from '../../metadata/';

import { ModelValidator, KeyValType } from '../';

/**
 * Helper class for converting plain objects to Entities ([[Table]]-decorated
 * classes).
 */
export class ModelTransformer {
  /**
   * Initialize with a [[ModelValidator]] instance.
   */
  constructor(private validator: ModelValidator = new ModelValidator) {
  }

  /**
   * Transform obj to an instance of type T.
   * @param obj - The object, which will be validated using a
   * [[ModelValidator]] instance, and then transformed into an entity of type
   * T.
   * @param Entity - The constructor of a [[Table]]-decorated class.  obj
   * will be transformed into one of these entities.
   * @return A promise that will be resolved with an [[EntityType]] instance,
   * or rejected with a validation error if the transformation is not possible.
   */
  async transform<T>(obj: object, Entity: EntityType<T>): Promise<T> {
    // Ensure the object is valid.
    await this.validator
      .validate(obj, Entity);

    // This is the returned entity.
    const entity = new Entity();

    // This is the metadata for each column.
    const colMeta = metaFactory
      .getColumnStore()
      .getColumnMetadata(Entity);

    for (let meta of colMeta) {
      // Undefined values are skipped.
      if ((obj as KeyValType)[meta.mapTo] !== undefined) {

        // Null values are copied over.
        if ((obj as KeyValType)[meta.mapTo] === null)
          (entity as KeyValType)[meta.mapTo] = null;
        else {
          // Map each column based on its data type.
          switch (meta.dataType) {
            case 'String':
            case 'Boolean':
              (entity as KeyValType)[meta.mapTo] =
                (obj as KeyValType)[meta.mapTo];
              break;

            case 'Date':
              // The validator verifies that the value is either an
              // IS08601 string or a Date instance.
              if (typeof (obj as KeyValType)[meta.mapTo] === 'string') {
                (entity as KeyValType)[meta.mapTo] =
                  new Date((obj as KeyValType)[meta.mapTo]);
              }
              else {
                (entity as KeyValType)[meta.mapTo] =
                  (obj as KeyValType)[meta.mapTo];
              }

              break;

            case 'Number':
              // The number might be a string, per NumberValidator.
              (entity as KeyValType)[meta.mapTo] =
                Number((obj as KeyValType)[meta.mapTo]);
              break;
          }
        }
      }
    }

    // Metadata about the Entity's relationships for sub-objects.
    const relMeta = metaFactory
      .getRelationshipStore()
      .getRelationships(Entity, null, false);

    for (let meta of relMeta) {
      const rawSubRes = (obj as KeyValType)[meta.mapTo];

      // Undefined sub-resources are skipped.
      if (rawSubRes !== undefined) {
        // For OneToMany relationships, the sub-resource is an array.  Each
        // element of the array is recursively transformed.
        if (meta.cardinality === 'OneToMany') {
          (entity as KeyValType)[meta.mapTo] = [];
          
          for (let obj of rawSubRes) {
            (entity as KeyValType)[meta.mapTo]
              .push(await this.transform(obj, meta.to()));
          }
        }
        else {
          // For *ToOne relationships, the sub-resource is an object.  It can be null,
          // but otherwise the sub object is transformed recursively.
          if (rawSubRes === null)
            (entity as KeyValType)[meta.mapTo] = null;
          else
            (entity as KeyValType)[meta.mapTo] = await this.transform(rawSubRes, meta.to());
        }
      }
    }

    return entity;
  }
}
