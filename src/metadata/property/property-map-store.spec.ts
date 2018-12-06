import { PropertyMapStore } from './property-map-store';

import metaFactory from '../metadata-factory';
import { initDB } from '../../test/entity/database';

import { User } from '../../test/entity/user.entity';

describe('.PropertyMapStore()', () => {
  let propStore: PropertyMapStore;

  beforeAll(function() {
    // (Re)initialize the db.
    initDB();

    // Reference to the global PropertyMapStore.
    propStore = metaFactory.getPropertyMapStore();
  });

  describe('.getPropertyMap()', () => {
    it('gets a PropertyMap for a table.', () => {
      const pm = propStore.getPropertyMap(User);

      expect(pm.id).toBe('id');
      expect(pm.username).toBe('username');
      expect(pm.first).toBe('first');
      expect(pm.last).toBe('last');
      expect(pm.createdOn).toBe('createdOn');
      expect(pm.phoneNumbers).toBe('phoneNumbers');
    });

    it('throws an error if the Entity is not decorated.', () => {
      class Test {};

      expect(() => propStore.getPropertyMap(Test))
        .toThrowError('Failed to get property map for type "Test."  The type must be decorated with @Table.');
    });

    it('returns the property map with the alias prefix.', () => {
      const pm = propStore.getPropertyMap(User, 'u');

      expect(pm.id).toBe('u.id');
      expect(pm.username).toBe('u.username');
      expect(pm.first).toBe('u.first');
      expect(pm.last).toBe('u.last');
      expect(pm.createdOn).toBe('u.createdOn');
      expect(pm.phoneNumbers).toBe('u.phoneNumbers');
    });
  });
});

