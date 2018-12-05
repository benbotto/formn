import { TableMetadata } from '../../metadata/table/table-metadata';
import { RelationshipMetadata } from '../../metadata/relationship/relationship-metadata';
import { JoinType } from './join-type';

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
   * @param joinType - The type of join (inner/outer), if this table was joined
   * in, or null for the parent.
   * @param cond - A join condition for the two tables.
   */
  constructor(
    public tableMetadata: TableMetadata,
    public alias: string,
    public parentAlias: string = null,
    public relationshipMetadata: RelationshipMetadata = null,
    public joinType: JoinType = null,
    public cond: object = null) {

    if (!this.alias)
      this.alias = this.tableMetadata.name;
  }
}

