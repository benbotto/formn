import { metaFactory, TableStore, ColumnStore, RelationshipStore } from '../../metadata/';

import { initDB, User, PhoneNumber, Photo, UserXProduct, Product } from '../../test/';

import { FromMeta, MySQLEscaper } from '../';

describe('FromMeta()', function() {
  let fromMeta: FromMeta;
  let relStore: RelationshipStore;
  let tblStore: TableStore;
  let colStore: ColumnStore;
  let escaper: MySQLEscaper;

  beforeAll(function() {
    // (Re)initialize the db.
    initDB();

    tblStore = metaFactory.getTableStore();
    colStore = metaFactory.getColumnStore();
    relStore = metaFactory.getRelationshipStore();
  });

  beforeEach(() =>
    fromMeta = new FromMeta(colStore, tblStore, relStore, new MySQLEscaper()));

  describe('.constructor()', function() {
    it('exposes a Map of table meta.', function() {
      expect(fromMeta.tableMetas instanceof Map).toBe(true);
    });

    it('exposes a Map of available column meta.', function() {
      expect(fromMeta.availableCols instanceof Map).toBe(true);
    });

    it('exposes a mapping hierarchy Map.', function() {
      expect(fromMeta.mapHierarchy instanceof Map).toBe(true);
    });
  });

  describe('.addTable()', function() {
    describe('error handling -', function() {
      it('throws an error if the table alias contains non-word characters.', function() {
        expect(function() {
          fromMeta.addTable(User, 'users alias');
        }).toThrowError('Alises must only contain word characters.');

        expect(function() {
          fromMeta.addTable(User, 'users.alias');
        }).toThrowError('Alises must only contain word characters.');
      });

      it('throws an error if a parent is supplied which does not match a table alias.', function() {
        expect(function() {
          fromMeta.addTable(PhoneNumber, 'pn', 'BAD_NAME');
        }).toThrowError('Table alias "BAD_NAME" is not a valid table alias.');
      });

      it('throws an error if a table alias has already been used.', function() {
        expect(function() {
          fromMeta
            .addTable(User, 'u')
            .addTable(User, 'u');
        }).toThrowError('The table alias "u" is not unique.');
      });

      it('throws an error if the child property is already mapped.', function() {
        expect(function() {
          fromMeta
            .addTable(User, 'u')
            .addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers', 'INNER JOIN')
            .addTable(PhoneNumber, 'pn2', 'u', 'phoneNumbers', 'INNER JOIN')
        }).toThrowError('The mapping "phoneNumbers" is not unique.');
      });

      it('allows the same table to be added if the mapping is unique to the parent.', function() {
        expect(function() {
          fromMeta
            .addTable(User, 'u')
            .addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers', 'INNER JOIN')
            .addTable(User, 'u2', 'pn', 'user', 'INNER JOIN')
        }).not.toThrow();
      });

      it('allows the same table to be nested twice under the same table if the mapping is unique.',
        function() {
        expect(function() {
          fromMeta
            .addTable(Photo, 'photo')
            .addTable(Photo, 'large', 'photo', 'largeThumbnail', 'LEFT OUTER JOIN')
            .addTable(Photo, 'small', 'photo', 'smallThumbnail', 'LEFT OUTER JOIN')
        }).not.toThrow();
      });
    });

    describe('table meta -', function() {
      it('uses the supplied alias when present.', function() {
        fromMeta.addTable(User, 'u');
        expect(fromMeta.tableMetas.has('u')).toBe(true);
      });

      it('stores the relationship between the two fromMeta.', () => {
        fromMeta.addTable(User, 'u');
        fromMeta.addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers');

        expect(fromMeta.tableMetas.get('pn').relationshipMetadata)
          .toBe(relStore.getRelationship(User, PhoneNumber, 'phoneNumbers'));
      });

      it('stores the TableMetadata for the entity.', function() {
        fromMeta.addTable(User, 'u');
        expect(fromMeta.tableMetas.get('u').tableMetadata)
          .toBe(tblStore.getTable(User));
      });

      it('sets the cond to null if not provided.', function() {
        fromMeta.addTable(User, 'u');
        expect(fromMeta.tableMetas.get('u').cond).toBeNull();
        expect(fromMeta.tableMetas.get('u').condStr).toBeNull();
      });

      it('stores the cond if provided.', function() {
        const cond = {$eq: {'u.id': 'pn.userID'}};
        fromMeta.addTable(User, 'u');
        fromMeta.addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers', 'INNER JOIN', cond);
        expect(fromMeta.tableMetas.get('pn').cond).toBe(cond);
        // Note that the column name u.id is mapped to u.userID in the condition string.
        expect(fromMeta.tableMetas.get('pn').condStr).toBe('`u`.`userID` = `pn`.`userID`');
      });

      it('stores the join parameters if supplied.', () => {
        const cond = {
          $and: [
            {$eq: {'u.id': 'pn.id'}},
            {$eq: {'u.first': ':myFirst'}},
            {$eq: {'pn.type': ':mobile'}}
          ]
        };

        const params = {myFirst: 'Ben', mobile: 'cell',};

        fromMeta.addTable(User, 'u');
        fromMeta.addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers', 'INNER JOIN', cond, params);

        expect(fromMeta.paramList.getParams().mobile).toBe('cell');
        expect(fromMeta.tableMetas.get('pn').cond).toBe(cond);
        expect(fromMeta.tableMetas.get('pn').condStr)
          .toBe('(`u`.`userID` = `pn`.`phoneNumberID` AND `u`.`firstName` = :myFirst AND `pn`.`type` = :mobile)');
      });

      it('throws an exception if one of the properties in the join condition is not available.', () => {
        const cond = {$eq: {'u.id': 'pn.foo'}};
        fromMeta.addTable(User, 'u');

        expect(() =>
          fromMeta.addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers', 'INNER JOIN', cond))
          .toThrowError('The column "pn.foo" is not available for a condition.');
      });

      it('sets the joinType to null if not provided.', function() {
        fromMeta.addTable(User, 'u');
        expect(fromMeta.tableMetas.get('u').joinType).toBe(null);
      });

      it('stores the joinType if provided.', function() {
        fromMeta.addTable(User, 'u');
        fromMeta.addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers', 'INNER JOIN', {$eq: {'u.id' : 'pn.userID'}});
        expect(fromMeta.tableMetas.get('pn').joinType).toBe('INNER JOIN');
      });

      it('sets the parent to null if not provided.', function() {
        fromMeta.addTable(User, 'u');
        expect(fromMeta.tableMetas.get('u').parentAlias).toBe(null);
      });

      it('stores the parent if provided.', function() {
        fromMeta.addTable(User, 'u');
        fromMeta.addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers', 'INNER JOIN', {$eq: {'u.id' : 'pn.userID'}});
        expect(fromMeta.tableMetas.get('pn').parentAlias).toBe('u');
      });
    });

    describe('map hierarchy -', function() {
      it('exposes the mapping hierarchy for all fromMeta.', function() {
        fromMeta
          .addTable(User, 'u')
          .addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers')
          .addTable(UserXProduct, 'uxp', 'u', 'userXProducts')
          .addTable(Product, 'p', 'uxp', 'product')

        expect(Array.from(fromMeta.mapHierarchy.get('u'))).toEqual(['phoneNumbers', 'userXProducts']);
        expect(Array.from(fromMeta.mapHierarchy.get('pn'))).toEqual([]);
        expect(Array.from(fromMeta.mapHierarchy.get('uxp'))).toEqual(['product']);
        expect(Array.from(fromMeta.mapHierarchy.get('p'))).toEqual([]);
      });
    });

    describe('column lookup -', () => {
      it('stores a lookup of fully-qualified property names to fully-qualified column names.', () => {
        fromMeta
          .addTable(User, 'u')
          .addTable(PhoneNumber, 'pn', 'u', 'phoneNumbers');

        expect(fromMeta.columnLookup.getColumn('u.id')).toBe('u.userID');
        expect(fromMeta.columnLookup.getColumn('u.first')).toBe('u.firstName');
        expect(fromMeta.columnLookup.getColumn('pn.id')).toBe('pn.phoneNumberID');
      });
    });

    describe('available columns -', function() {
      it('exposes the table alias, column, and FQ name of each column in the table.', function() {
        fromMeta.addTable(User, 'u');

        const colMeta = fromMeta.availableCols.get('u.first');

        expect(colMeta.tableAlias).toBe('u');
        expect(colMeta.columnMetadata).toBe(colStore.getColumnMetadataByName(User, 'firstName'));
        expect(colMeta.fqColName).toBe('u.firstName');
        expect(colMeta.fqProp).toBe('u.first');
      });
    });
  });

  describe('.isColumnAvailable()', function() {
    it('returns true when a column is available.', function() {
      fromMeta.addTable(User, 'u');
      expect(fromMeta.isColumnAvailable('u.first')).toBe(true);
      expect(fromMeta.isColumnAvailable('u.last')).toBe(true);
    });

    it('returns false when a column is not available.', function() {
      fromMeta.addTable(User, 'u');
      expect(fromMeta.isColumnAvailable('u.other')).toBe(false);
    });
  });

  describe('.getFromColumnMetaByProp()', () => {
    it('returns the metadata about the column.', () => {
      fromMeta.addTable(User, 'u');

      const meta = fromMeta.getFromColumnMetaByProp('u.id');
      expect(meta.fqColName).toBe('u.userID');
      expect(meta.fqProp).toBe('u.id');
      expect(meta.tableAlias).toBe('u');
    });

    it('throws an error if the column is not available.', () => {
      fromMeta.addTable(User, 'u');

      expect(() => fromMeta.getFromColumnMetaByProp('foo'))
        .toThrowError('Column "foo" is not available.  Columns must be fully-qualified (<table-alias>.<property>).');
    });
  });
});

