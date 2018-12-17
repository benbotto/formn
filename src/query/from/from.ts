import { assert } from '../../error/assert';
import { ConditionError } from '../../error/condition-error';

import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { TableType } from '../../metadata/table/table-type';

import { Escaper } from '../escaper/escaper';

import { ParameterType } from '../condition/parameter-type';
import { ParameterList } from '../condition/parameter-list';

import { FromMeta } from './from-meta';
import { FromTableMeta } from './from-table-meta';
import { JoinType } from './join-type';

/**
 * Represents the FROM portion of a query, with any JOINs and optionally a
 * WHERE condition.  This class is used when selecting, updating, or deleting.
 */
export class From {
  private fromMeta: FromMeta;

  /**
   * Initialize.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]]).  Used when escaping column names in
   * compiled conditions.
   * @param FromEntity - Constructor of the FROM table.
   * @param fromAlias - Alias for the FROM table, used in conditions, joins,
   * and column selection.  Optional: defaults to the name of the table.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: Escaper,
    FromEntity: TableType,
    fromAlias?: string) {

    this.fromMeta = new FromMeta(this.colStore, this.tblStore,
      this.relStore, this.escaper);

    // Table alias defaults to the name of the table.
    if (fromAlias === undefined)
      fromAlias = this.tblStore.getTable(FromEntity).name;

    this.fromMeta.addTable(FromEntity, fromAlias);
  }

  /**
   * Helper method to get the meta data of the FROM table, which is the first
   * table in [[FromMeta]].
   * @return A meta object describing the table.
   */
  getBaseTableMeta(): FromTableMeta {
    return this.fromMeta.tableMetas.values().next().value;
  }

  /**
   * Helper method to get the meta data of the JOIN'd in tables.
   * @return An array of meta objects describing each table.  The meta objects
   * are in insertion order (e.g. in the order the tables were joined in).
   */
  getJoinMeta(): FromTableMeta[] {
    // All but the first table (the first table is the FROM table).
    return Array.from(this.fromMeta.tableMetas.values()).slice(1);
  }

  /**
   * Join in a table.
   * @param joinType - How to join the two tables (INNER JOIN, LEFT OUTER JOIN).
   * @param Entity - The [[Table]]-decorated Entity to join in.
   * @param alias - Alias of the joined-in table.
   * @param fqParentProperty - The fully-qualified property name on the parent
   * Entity to which this Entity will be mapped.
   * @param joinCond - An optional condition that describes how to join the two
   * tables.  If not supplied then the join condition will be derived.
   * @param joinParams - An optional set of parameters that will be used to
   * replace values in joinCond.
   */
  join<J>(
    joinType: JoinType,
    Entity: TableType,
    alias: string,
    fqParentProperty: string,
    joinCond?: object,
    joinParams?: ParameterType): this {

    // Get the parent alias and property name.
    const propRE = /^(\w+)\.(\w+)$/;

    assert(fqParentProperty.match(propRE),
      'Parent property must be in the form <parent-alias>.<property>.')

    const [, parAlias, parProperty] = fqParentProperty.match(propRE);

    // Pull the metadata about the parent.  (Throws if not found.)
    const parTblMeta = this.fromMeta.getTableMetadataByAlias(parAlias);

    // Find the relationship between the two tables.
    const relationship = this.relStore
      .getRelationship(parTblMeta.Entity, Entity, parProperty);

    if (joinCond === undefined) {
      // Create the join condition.
      let onPropsArr: any = relationship
        .on(
          this.propStore.getPropertyMap(parTblMeta.Entity, parAlias),
          this.propStore.getPropertyMap(Entity, alias));

      // The join condition is usually between two properties, but with joins
      // involving composite keys onProps will be an array of arrays.
      if (!Array.isArray(onPropsArr[0]))
        onPropsArr = [onPropsArr];

      // Create the join condition(s).
      const conds = onPropsArr
        .map((onProps: string[]) => {
          assert(onProps.length === 2,
            `Relationship (on) between "${parTblMeta.Entity.name}" and "${Entity.name}" must contain exactly 2 properties.`);

          return {$eq: {[`${onProps[0]}`]: `${onProps[1]}`}};
        });

      // If there is more than one condition then they're AND'd.
      joinCond = conds.length === 1 ? conds[0] : {$and: conds};
    }

    // Store the metadata about the table.
    this.fromMeta
      .addTable(Entity, alias, parAlias, parProperty, joinType, joinCond, joinParams);

    return this;
  }

  /**
   * Inner join in a table.  See [[From.join]].
   */
  innerJoin<J>(
    Entity: TableType,
    alias: string,
    fqParentProperty: string,
    joinCond?: object,
    joinParams?: ParameterType): this {

    return this
      .join('INNER JOIN', Entity, alias, fqParentProperty, joinCond, joinParams);
  }

  /**
   * Left outer join in a table.  See [[From.join]].
   */
  leftOuterJoin<J>(
    Entity: TableType,
    alias: string,
    fqParentProperty: string,
    joinCond?: object,
    joinParams?: ParameterType): this {

    return this
      .join('LEFT OUTER JOIN', Entity, alias, fqParentProperty, joinCond, joinParams);
  }

  /**
   * Add a WHERE condition to the query.  This method can only be called one
   * time (if called a second time an exception is raised).
   * @param cond - The where condition object.
   * @param params - Any parameter replacements in the condition object.
   */
  where(cond: object, params: ParameterType): this {
    const tblMeta = this.getBaseTableMeta();

    assert(tblMeta.cond === null,
      'where already performed on query.');

    // Noop if cond is an empty object.
    if (Object.keys(cond).length === 0 && cond.constructor === Object)
      return this;

    // Set the condition on the base table.
    this.fromMeta.setCondition(tblMeta.alias, cond, params);

    return this;
  }

  /**
   * Get the FROM portion of the query as a string.
   * @return The FROM portion of the query (FROM &lt;table&gt; AS
   * &lt;alias&gt;), escaped.
   */
  getFromString(): string {
    const baseMeta  = this.getBaseTableMeta();
    const baseName  = this.escaper.escapeFullyQualifiedColumn(baseMeta.tableMetadata.getFQName());
    const baseAlias = this.escaper.escapeProperty(baseMeta.alias);

    return `FROM    ${baseName} AS ${baseAlias}`;
  }

  /**
   * Get the JOIN parts of the query string.
   * @return The JOIN parts of the query, escaped.
   */
  getJoinString(): string {
    // Add any JOINs.  The first table is the FROM table, hence the initial
    // next() call on the table iterator.
    return this.getJoinMeta()
      .map(tblMeta  => {
        const joinName  = this.escaper.escapeFullyQualifiedColumn(tblMeta.tableMetadata.getFQName());
        const joinAlias = this.escaper.escapeProperty(tblMeta.alias);
        let   sql       = `${tblMeta.joinType} ${joinName} AS ${joinAlias}`;

        if (tblMeta.condStr)
          sql += ` ON ${tblMeta.condStr}`;

        return sql;
      })
      .join('\n');
  }

  /**
   * Get the WHERE portion of the query string.
   * @return The WHERE part of the query, or a blank string if there is no
   * where clause.
   */
  getWhereString(): string {
    const baseMeta = this.getBaseTableMeta();

    return baseMeta.condStr ? `WHERE   ${baseMeta.condStr}` : '';
  }

  /**
   * Get the SQL that represents the query.
   * @return The actual SQL query (FROM, JOINS, and WHERE).
   */
  toString(): string {
    const parts = [
      this.getFromString(),
      this.getJoinString(),
      this.getWhereString()
    ];

    return parts
      .filter(part => part !== '')
      .join('\n');
  }

  /**
   * Get the list of parameters for the From.
   */
  getParameterList(): ParameterList {
    return this.fromMeta.paramList;
  }

  /**
   * Get the metadata (tables, columns, and parameters).
   */
  getFromMeta(): FromMeta {
    return this.fromMeta;
  }
}

