import { RelationshipStore } from './relationship-store';
import metaFactory from './metadata-factory';
import { initDB } from '../test/entity/database';

import { PhoneNumber } from '../test/entity/phone-number.entity';
import { Product } from '../test/entity/product.entity';
import { User } from '../test/entity/user.entity';
import { Photo } from '../test/entity/photo.entity';

describe('RelationshipStore()', function() {
  let relStore: RelationshipStore;

  beforeAll(function() {
    // (Re)initialize the db.
    initDB();

    // Reference to the global RelationshipStore.
    relStore = metaFactory.getRelationshipStore();
  });

  /**
   * Get relationships.
   */
  describe('.getRelationships()', function() {
    it('returns an empty array for tables that do not have relationships.', function() {
      expect(relStore.getRelationships(Product, PhoneNumber)).toEqual([]);
    });

    it('doesn\'t matter what order the tables are in.', function() {
      let rels;
      
      rels = relStore.getRelationships(User, PhoneNumber);
      expect(rels.length).toBe(1);
      expect(rels[0].Entity).toBe(PhoneNumber);
      expect(rels[0].getRefEntity()).toBe(User);
      expect(rels[0].column).toBe('userID');

      rels = relStore.getRelationships(User, PhoneNumber);
      expect(rels.length).toBe(1);
      expect(rels[0].Entity).toBe(PhoneNumber);
      expect(rels[0].getRefEntity()).toBe(User);
      expect(rels[0].column).toBe('userID');
    });

    it('handles circular references.', function() {
      const rels = relStore.getRelationships(Product, Photo);

      expect(rels.length).toBe(2);
      expect(rels[0].Entity).toBe(Product);
      expect(rels[0].getRefEntity()).toBe(Photo);
      expect(rels[0].column).toBe('primaryPhotoID');
      expect(rels[1].Entity).toBe(Photo);
      expect(rels[1].getRefEntity()).toBe(Product);
      expect(rels[1].column).toBe('prodID');
    });

    it('can restrict the returned keys to those owned by the first table.', function() {
      const rels = relStore.getRelationships(Product, Photo, true);

      expect(rels.length).toBe(1);
      expect(rels[0].Entity).toBe(Product);
      expect(rels[0].getRefEntity()).toBe(Photo);
      expect(rels[0].column).toBe('primaryPhotoID');
    });

    it('does not duplicate self-referencing foreign keys.', function() {
      const rels = relStore.getRelationships(Photo, Photo);
      expect(rels.length).toBe(2);
      expect(rels[0].Entity).toBe(Photo);
      expect(rels[0].getRefEntity()).toBe(Photo);
      expect(rels[0].column).toBe('largeThumbnailID');
      expect(rels[1].Entity).toBe(Photo);
      expect(rels[1].getRefEntity()).toBe(Photo);
      expect(rels[1].column).toBe('smallThumbnailID');
    });
  });
});

