import { assert } from '../../error/assert';

import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { EntityType } from '../../metadata/table/entity-type';
import { ColumnMetadata } from '../../metadata/column/column-metadata';

import { FromTableMeta } from './from-table-meta';
import { FromColumnMeta } from './from-column-meta';
import { JoinType } from './join-type';

/**
 * A helper class for keeping meta data about a list of tables.  Used in the
 * [[From]] class.
 */
export class FromTableMetaList {
  /**
   * A map from table alias to [[FromTableMeta]] objects.
   */
  public tableMetas: Map<string, FromTableMeta> = new Map();

  /**
   * A map from fully-qualified property name to [[FromColumnMeta]].  These are
   * the columns that are available for selecting, performing conditions on, or
   * ordering by.
   */
  public availableCols: Map<string, FromColumnMeta> = new Map();

  /**
   * Holds the mapping ([[RelationshipMetadata.mapTo]]) hierarchy.  The map
   * uses the parent alias as the key and a Set of mapping names (mapTo) as the
   * values.  The same mapping can be used multiple times, but each mapping
   * must be unique to a parent.  For example, it's valid for a person to have
   * a "photo" and a building to have a "photo," but there cannot be two
   * "photo" properties at the top level, nor under person.
   */
  public mapHierarchy: Map<string, Set<string>> = new Map();
  
  /**
   * Initialize.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for finding relationships between parent and child
   * tables.
   */
  constructor(
    private colStore: ColumnStore,
    private tblStore: TableStore,
    private relStore: RelationshipStore) {
  }

  /**
   * Add a table to the list and make all the columns in the table "available"
   * for use in a select, condition, or order clause.
   * @param Entity - Constructor of the [[Table]]-decorated class.
   * @param alias - Alias of the table.
   * @param parentAlias - Alias of the parent table.
   * @param property - Property in the parent Entity to which children will be
   * mapped.
   * @param joinType - How this table was joined to from the parent.
   * @param cond - A join condition object for the two tables.
   */
  addTable(
    Entity: EntityType,
    alias: string,
    parentAlias: string = null,
    property: string = null,
    joinType: JoinType = null,
    cond: object = null): FromTableMetaList {

    let parentTblMeta = null;
    let relationshipMetadata = null;

    const tableMetadata = this.tblStore.getTable(Entity);

    // Aliases must be word characters.  They can't, for example, contain
    // periods.
    assert(alias.match(/^\w+$/) !== null,
      'Alises must only contain word characters.');

    // The alias must be unique.
    assert(!this.tableMetas.has(alias),
      `The table alias "${alias}" is not unique.`);

    // If a parent is specified, make sure it is a valid alias.
    if (parentAlias !== null) {
      assert(this.tableMetas.has(parentAlias),
        `Parent table alias "${parentAlias}" is not a valid table alias.`);

      parentTblMeta = this.tableMetas.get(parentAlias).tableMetadata;
    }

    // The table alias is guaranteed to be unique here.  Add it to the map
    // hierarchy.
    this.mapHierarchy.set(alias, new Set());

    // The mapping must be unique to a parent.
    if (property !== null) {
      assert(!this.mapHierarchy.get(parentAlias).has(property),
        `The mapping "${property}" is not unique.`);
      this.mapHierarchy.get(parentAlias).add(property);

      // Get the relationship between the parent and the child.
      relationshipMetadata = this.relStore
        .getRelationship(parentTblMeta.Entity, Entity, property);
    }

    // Add the table to the list of tables.
    const tableMeta = new FromTableMeta(
      tableMetadata, alias, parentAlias, relationshipMetadata, joinType, cond);

    this.tableMetas.set(alias, tableMeta);

    // Make each column available for selection or conditions.
    const colMetas = this.colStore.getColumnMetadata(Entity);
    
    colMetas.forEach(colMeta => {
      const fqColName = ColumnMetadata
        .createFQName(alias, colMeta.name);
      const fqProp = ColumnMetadata
        .createFQName(alias, colMeta.mapTo);

      this.availableCols
        .set(fqProp, new FromColumnMeta(alias, colMeta, fqColName, fqProp));
    }, this);

    return this;
  }

  /**
   * Check if the column is available (for selecting, for a condition, or for
   * an order by clause).
   * @param fqProp - The fully-qualified property name to look for.
   */
  isColumnAvailable(fqProp: string): boolean {
    return this.availableCols.has(fqProp);
  }
}

