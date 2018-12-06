import { EntityType } from '../table/entity-type';
import { PropertyMapType } from './property-map-type';
import { assert } from '../../error/assert';

/**
 * Stores property maps for each [[Table]]-decorated Entity.  A property map is
 * a simple key-value pair.  The keys are all the properties of Entity, and
 * each maps to the property name as a string.
 */
export class PropertyMapStore {
  private propMaps: Map<EntityType, PropertyMapType> = new Map();

  /**
   * Add a property to the store.
   */
  addProperty(Entity: EntityType, property: string): PropertyMapStore {
    // Keep a local map of Table to Property names.
    // (See RelationshipMetaOptions: This is what's passed to "on.").
    if (!this.propMaps.has(Entity))
      this.propMaps.set(Entity, {});

    const pm = this.propMaps
      .get(Entity);

    pm[property] = property;

    return this;
  }

  /**
   * Get the property map for a table.  For each property in the
   * [[Table]]-decorated Entity, the property map is a simple key-value pair.
   * The keys are all the properties of Entity, and each maps to the property
   * name as a string.
   * @param Entity - The [[Table]]-decorated Entity.
   * @param alias - An optional table alias.  If supplied each value in the property map will
   * be prefixed with the alias as &lt;alias&gt;.&lt;property&gt;.
   */
  getPropertyMap(Entity: EntityType, alias?: string): PropertyMapType {
    const pm = this.propMaps.get(Entity);

    assert(pm, `Failed to get property map for type "${Entity.name}."  The type must be decorated with @Table.`);

    if (alias == undefined)
      return pm;

    const aliasedPM: PropertyMapType = {};

    for (let key in pm)
      aliasedPM[key] = `${alias}.${pm[key]}`;

    return aliasedPM;
  }
}

