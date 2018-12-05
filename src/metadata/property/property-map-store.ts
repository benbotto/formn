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
   */
  getPropertyMap(Entity: EntityType): PropertyMapType {
    const pm = this.propMaps.get(Entity);

    assert(pm, `Failed to get property map for type "${Entity.name}."  The type must be decorated with @Table.`);

    return pm
  }
}

