import { UpdateType } from './update-type';

import { assert } from '../../error/assert';

import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';

import { ParameterList } from '../condition/parameter-list';

import { MySQLEscaper } from '../escaper/mysql-escaper';
import { MySQLExecuter } from '../executer/mysql-executer';
import { From } from '../from/from';
import { FromColumnMeta } from '../from/from-column-meta';
import { ExecutableQuery } from '../executable-query';
import { Update } from './update';

/**
 * A [[Query]] that represents an UPDATE for a MySQL database.
 */
export class MySQLUpdate extends Update {
  /**
   * Initialize the query using a From instance.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - An [[Escaper]] for MySQL.  Used when escaping column
   * names.
   * @param executer - An [[Executer]] instance for MySQL.
   * @param from - A [[From]] instance which holds the base table, all
   * joined-in tables, and the where clause.
   * @param model - An object containing key-value pairs.  Each key must
   * correspond to a fully-qualified property
   * (&lt;table-alias&gt;.&lt;property&gt;), and each associated value is the
   * value to update in the database.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: MySQLEscaper,
    protected executer: MySQLExecuter,
    protected from: From,
    protected model: UpdateType) {

    super(colStore, tblStore, relStore, propStore, escaper, executer, from, model);
  }

  /**
   * Get the SQL that represents the query.
   * @return The SQL representing the select statement.
   */
  toString(): string {
    if (this.updateCols.length === 0)
      return '';

    // UPDATE part.
    let sql = this.from
      .getFromString()
      .replace(/^FROM  /, 'UPDATE');
    sql += '\n';

    // JOIN part.
    const join = this.from.getJoinString();

    if (join)
      sql += `${join}\n`;

    // SET part.
    sql += 'SET\n';

    sql += this.updateCols
      .map(fromColMeta => {
        const colName   = this.escaper.escapeFullyQualifiedColumn(fromColMeta.fqColName);
        const paramName = this.paramLookup.get(fromColMeta.fqProp);

        return `${colName} = :${paramName}`;
      })
      .join(',\n');

    // WHERE part.
    const where = this.from.getWhereString();

    if (where)
      sql += `\n${where}`;

    return sql;
  }
}

