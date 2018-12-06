import metaFactory from '../../metadata/metadata-factory';
import { TableStore } from '../../metadata/table/table-store';
import { ColumnStore } from '../../metadata/column/column-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { EntityType } from '../../metadata/table/entity-type';

import { MySQLEscaper } from '../escaper/mysql-escaper';

import { User } from '../../test/entity/user.entity';
import { PhoneNumber } from '../../test/entity/phone-number.entity';
import { Photo } from '../../test/entity/photo.entity';
import { UserXProduct } from '../../test/entity/user-x-product.entity';
import { Product } from '../../test/entity/product.entity';

import { initDB } from '../../test/entity/database';
import { From } from './from';

describe('From()', () => {
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let propStore: PropertyMapStore;
  let escaper: MySQLEscaper;
  let getFrom: (FromEntity: EntityType, fromAlias?: string) => From;

  beforeEach(function() {
    initDB();

    tblStore  = metaFactory.getTableStore();
    colStore  = metaFactory.getColumnStore();
    relStore  = metaFactory.getRelationshipStore();
    propStore = metaFactory.getPropertyMapStore();
    escaper   = new MySQLEscaper();

    // From curry: produce a From instance with just an entity and alias.
    getFrom = (FromEntity: EntityType, fromAlias?: string) =>
      new From(colStore, tblStore, relStore, propStore, escaper, FromEntity, fromAlias);
  });

  describe('.constructor()', () => {
    it('defaults the table alias to the table name.', () => {
      const from = getFrom(User);

      expect(from.getFromMeta().alias).toBe('users');
    });

    it('uses the supplied table alias.', () => {
      const from = getFrom(User, 'u');

      expect(from.getFromMeta().alias).toBe('u');
    });
  });

  describe('.join()', () => {
    it('throws an error if the parent property is not in the correct format.', () => {
      const from = getFrom(User);
      expect(() => from.join('INNER JOIN', PhoneNumber, 'pn', 'bad'))
        .toThrowError('Parent property must be in the form <parent-alias>.<property>.');
    });

    it('stores metadata about the join table with a derived condition.', () => {
      const from = getFrom(User, 'u')
        .join('INNER JOIN', PhoneNumber, 'pn', 'u.phoneNumbers');

      const meta = from.getJoinMeta()[0];

      expect(meta.alias).toBe('pn');
      expect(meta.parentAlias).toBe('u');
      expect(meta.joinType).toBe('INNER JOIN');
      expect(meta.cond).toEqual({$eq: {'u.id': 'pn.userID'}});
      expect(meta.relationshipMetadata).toBe(relStore.getRelationship(User, PhoneNumber, 'phoneNumbers'));
      expect(meta.tableMetadata).toBe(tblStore.getTable(PhoneNumber));
    });

    it('throws an error if the relationship between the two tables contains the wrong number of properties.', () => {
      const rel = relStore.getRelationship(User, PhoneNumber, 'phoneNumbers');

      rel.on = () => ['asdf'];
      expect(() => getFrom(User, 'u')
        .join('INNER JOIN', PhoneNumber, 'pn', 'u.phoneNumbers'))
        .toThrowError('Relationship (on) between "User" and "PhoneNumber" must contain exactly 2 properties.');
    });
  });

  describe('.innerJoin()', () => {
    it('Joins using an INNER JOIN.', () => {
      const from = getFrom(User, 'u')
        .innerJoin(PhoneNumber, 'pn', 'u.phoneNumbers');

      const meta = from.getJoinMeta()[0];

      expect(meta.joinType).toBe('INNER JOIN');
    });
  });

  describe('.leftOuterJoin()', () => {
    it('Joins using an LEFT OUTER JOIN.', () => {
      const from = getFrom(User, 'u')
        .leftOuterJoin(PhoneNumber, 'pn', 'u.phoneNumbers');

      const meta = from.getJoinMeta()[0];

      expect(meta.joinType).toBe('LEFT OUTER JOIN');
    });
  });
});
