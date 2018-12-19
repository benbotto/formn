import { TableMetadata, RelationshipMetadata } from '../../metadata/';

import { JoinType } from '../';

/**
 * Keeps metadata about a table that is used in the FROM portion of a query.
 */
export class FromTableMeta {
  /**
   * Store the table metadata.
   * @param tableMetadata - Metadata about the table.
   * @param alias - An alias for the table.  This is needed if, for example,
   * the same table is joined in multiple times.
   * @param parentAlias - The alias of the parent table, if any.
   * @param relationshipMetadata - Metadata about the relationship from the parent to
   * the child.
   * @param joinType - The type of join (inner/outer) if this table was joined
   * in, or null for the top-level table.
   * @param cond - A join condition for the two tables, or a where condition
   * for the base table.
   * @param condStr - The compiled condition string as created by a
   * [[ConditionCompiler]].
   */
  constructor(
    public tableMetadata: TableMetadata,
    public alias: string,
    public parentAlias: string = null,
    public relationshipMetadata: RelationshipMetadata = null,
    public joinType: JoinType = null,
    public cond: object = null,
    public condStr: string = null) {
  }
}

