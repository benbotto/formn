import { assert } from '../../error/assert';
import { ConditionError } from '../../error/condition-error';

import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { EntityType } from '../../metadata/table/entity-type';
import { ColumnMetadata } from '../../metadata/column/column-metadata';
import { ColumnLookup } from '../../metadata/column/column-lookup';
import { TableMetadata } from '../../metadata/table/table-metadata';

import { ConditionLexer } from '../condition/condition-lexer';
import { ConditionParser } from '../condition/condition-parser';
import { ConditionCompiler } from '../condition/condition-compiler';
import { ParameterList } from '../condition/parameter-list';
import { ParameterType } from '../condition/parameter-type';

import { Escaper } from '../escaper/escaper';

import { FromTableMeta } from './from-table-meta';
import { FromColumnMeta } from './from-column-meta';
import { JoinType } from './join-type';

/**
 * A helper class for keeping metadata about tables and columns used in a
 * [[From]] instance.
 */
export class FromMeta {
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
   * "photo" properties at same level (e.g. under person).
   */
  public mapHierarchy: Map<string, Set<string>> = new Map();

  /**
   * Lookup functionality between fully-qualified property names and
   * fully-qualified column names.  Users operate on [[Column]]-decorated
   * properties, but ultimately those properties need to be mapped to
   * fully-qualified column names when querying.
   */
  public columnLookup: ColumnLookup = new ColumnLookup();

  /**
   * Stores all the parameters for the query.  The parameters are used for
   * WHERE and ON conditions.
   */
  public paramList: ParameterList = new ParameterList();
  
  /**
   * Initialize.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for finding relationships between parent and child
   * tables.
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]].  Used when escaping column names in
   * compiled conditions.
   */
  constructor(
    private colStore: ColumnStore,
    private tblStore: TableStore,
    private relStore: RelationshipStore,
    private escaper: Escaper) {
  }

  /**
   * Add a table to the list and make all the columns in the table "available"
   * for use in a select, condition, or order clause.
   * @param Entity - Constructor of the [[Table]]-decorated class.
   * @param alias - Alias of the table.
   * @param parentAlias - Alias of the parent table.
   * @param property - Property in the parent Entity to which children (this
   * Entity) will be mapped.
   * @param joinType - How this table was joined to from the parent.
   * @param cond - A join condition object for the two tables, or a where
   * condition object for the parent table.
   * @param params - Any parameters used in the condition.
   */
  addTable(
    Entity: EntityType,
    alias: string,
    parentAlias: string = null,
    property: string = null,
    joinType: JoinType = null,
    cond: object = null,
    params: ParameterType = null): FromMeta {

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
    if (parentAlias !== null)
      parentTblMeta = this.getTableMetadataByAlias(parentAlias);

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
      tableMetadata, alias, parentAlias, relationshipMetadata, joinType);

    this.tableMetas.set(alias, tableMeta);

    // Make each column available for selection or conditions, and keep
    // a lookup of fq-property names to fq-column names.
    const colMetas = this.colStore.getColumnMetadata(Entity);
    
    colMetas.forEach(colMeta => {
      const fqColName = ColumnMetadata
        .createFQName(alias, colMeta.name);
      const fqProp = ColumnMetadata
        .createFQName(alias, colMeta.mapTo);

      this.availableCols
        .set(fqProp, new FromColumnMeta(alias, colMeta, fqColName, fqProp));

      this.columnLookup
        .addColumn(fqProp, fqColName);
    });

    // Add the condition to the table meta if provided.
    if (cond)
      this.setCondition(alias, cond, params);

    return this;
  }

  /**
   * Set the condition object on one of the [[FromTableMeta]] objects and
   * compile it.
   * @param alias - Alias of the table to which the condition will be added.
   * @param cond - The condition object to add and compile.
   * @param params - Any parameters in the cond object.
   */
  setCondition(alias: string, cond: object, params: ParameterType = null): FromMeta {
    const tblMeta = this.getFromTableMetaByAlias(alias);

    if (params)
      this.paramList.addParameters(params);

    const condStr = this.compileCondition(cond);

    tblMeta.cond    = cond;
    tblMeta.condStr = condStr;

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

  /**
   * Get the [[FromTableMeta]] for a table by alias or throw.
   * @param alias - Alias of the table.
   */
  getFromTableMetaByAlias(alias: string): FromTableMeta {
    assert(this.tableMetas.has(alias),
      `Table alias "${alias}" is not a valid table alias.`);

    return this.tableMetas.get(alias);
  }

  /**
   * Get the [[TableMetadata]] for a table by alias or throw.
   * @param alias - Alias of the table.
   */
  getTableMetadataByAlias(alias: string): TableMetadata {
    return this.getFromTableMetaByAlias(alias).tableMetadata;
  }

  /**
   * Helper method to compile a condition.  The compilation process ensures
   * that each parameter in the condition has a replacement in the parameter
   * list, and that each fully-qualified property in the condition is available
   * (that is, belongs to one of the tables used in the [[From]]).  Also, a
   * [[ColumnLookup]] is supplied so that fully-qualified property names can be
   * mapped to the associated column names.
   */
  compileCondition(cond: object): string {
    // Lex and parse the condition.
    const tokens   = new ConditionLexer().parse(cond);
    const tree     = new ConditionParser().parse(tokens);
    const compiler = new ConditionCompiler(this.escaper);

    // Make sure that each column in the condition is available for selection.
    const columns = compiler.getColumns(tree);

    for (let i = 0; i < columns.length; ++i) {
      if (!this.isColumnAvailable(columns[i]))
        throw new ConditionError(`The column "${columns[i]}" is not available for a condition.`);
    }

    return compiler.compile(tree, this.paramList.params);
  }
}

