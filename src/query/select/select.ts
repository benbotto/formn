import { assert } from '../../error/assert';

import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { ColumnMetadata } from '../../metadata/column/column-metadata';

import { Schema } from '../../datamapper/schema';
import { DataMapper } from '../../datamapper/data-mapper';

import { Query } from '../query';
import { Escaper } from '../escaper/escaper';
import { Executer } from '../executer/executer';
import { From } from '../from/from';
import { FromColumnMeta } from '../from/from-column-meta';
import { OrderByType } from './order-by-type';
import { ExecutableQuery } from '../executable-query';

/**
 * Represents a SELECT query.
 */
export class Select<T> extends Query {
  // These are the columns that the user selected, by fully-qualified property.
  // It's a map from property name to FromColumnMeta.
  private selectCols: Map<string, FromColumnMeta> = new Map();

  // The order of the query.
  private order: OrderByType[] = [];

  /**
   * Initialize the query using a From instance.
   * @param colStore - Used for accessing columns in tables.
   * @param tblStore - Used for accessing tables in the database.
   * @param relStore - Used for accessing relationships between tables.
   * @param propStore - Used for pulling table property maps (used in
   * conjunction with the relStore to get remote columns).
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]]).  Used when escaping column names in
   * compiled conditions.
   * @param executer - An [[Executer]] instance that matches the database type
   * (e.g. [[MySQLExecuter]]).
   * @param from - A [[From]] instance which holds the base table, all
   * joined-in tables, and the where clause.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: Escaper,
    protected executer: Executer,
    private from: From) {

    super(colStore, tblStore, relStore, propStore, escaper, executer);
  }

  /**
   * Select columns manually.
   * @param cols - An optional set of columns to select.  Each argument should
   * be a fully-qualified property name in the form
   * &lt;table-alias&gt;.&lt;property&gt;.  If no columns are specified, then
   * all columns are selected.
   */
  select(...cols: string[]): Select<T> {
    const fromMeta = this.from.getFromMeta();

    // Select may only be performed once on a query.
    assert(this.selectCols.size === 0,
      'select already performed on query.');

    // If no columns are provided, select all.
    if (cols.length === 0) {
      cols = this.from
        .getFromMeta()
        .getFromColumnMeta()
        .map(col => col.fqProp);
    }

    cols.forEach(fqProp => {
      // Each column can only be selected once.  This is only a constraint because
      // of the way that the primary key is found in execute.  If the primary key
      // of a table was selected twice, there would not be a way to serialize
      // the primary key correctly.
      assert(!this.selectCols.has(fqProp),
        `Column "${fqProp}" already selected.`);

      // Store the necessary metadata about the column selection.  This is
      // what's needed for converting the query to a string, and for
      // serialization.
      // Throws if the column is not available for selection.
      const fromColMeta = fromMeta.getFromColumnMetaByProp(fqProp);
      this.selectCols.set(fqProp, fromColMeta);
    });

    // The primary key from each table must be selected.  The serialization
    // needs a way to uniquely identify each object; the primary key is used
    // for this.
    const fromTblMetas = fromMeta.getFromTableMeta();

    fromTblMetas
      .forEach(fromTblMeta => {
        const tblAlias = fromTblMeta.alias;
        const tblMeta  = fromTblMeta.tableMetadata;

        // This is the primary key of the table, which is an array.
        const pk = this.colStore
          .getPrimaryKey(tblMeta.Entity);

        for (let i = 0; i < pk.length; ++i) {
          // This is the alias of the column in the standard
          // <table-alias>.<property> format.
          const pkAlias = ColumnMetadata
            .createFQName(tblAlias, pk[i].mapTo);

          assert(this.selectCols.has(pkAlias),
            'The primary key of every table must be selected, but the primary key ' +
            `of table "${tblMeta.getFQName()}" (alias "${tblAlias}") ` +
            'was not selected.');
        }
      });

    return this;
  }

  /**
   * Order by one or more columns.
   * @param orders - A list of fully-qualified properties in the form
   * &lt;table-alias&gt;.&lt;property&gt;, or an array of [[OrderByType]] with
   * the fully-qualified property and direction.
   */
  orderBy(...orders: OrderByType[] | string[]): Select<T> {
    // orderBy may only be called once.
    assert(this.order.length === 0,
      'orderBy already performed on query.');

    for (let i = 0; i < orders.length; ++i) {
      const order: OrderByType = typeof orders[i] === 'string' ?
        {fqProperty: orders[i], dir: 'ASC'} as OrderByType :
        orders[i] as OrderByType;

      // Make sure the column is available for ordering.
      const fromMeta = this.from.getFromMeta();

      assert(fromMeta.isColumnAvailable(order.fqProperty),
        `"${order.fqProperty}" is not available for orderBy.`);

      this.order.push(order);
    }

    return this;
  }

  /**
   * Get the SQL that represents the query.
   * @return The SQL representing the select statement.
   */
  toString(): string {
    let sql = 'SELECT  ';

    // No columns specified.
    assert(this.selectCols.size, 'No columns selected.  Call select().');

    // Escape each selected column and add it to the query.
    const cols = Array.from(this.selectCols.values());

    sql += cols
      .map(col => {
        // Fully-qualified column name, escaped.
        const colName = this.escaper.escapeFullyQualifiedColumn(col.fqColName);

        // Alias is the fully-qualified property name, which is guaranteed unique
        // even if the same table is referenced twice and makes it readable when
        // debugging in that it gives information about the mapping.
        const colAlias = this.escaper.escapeProperty(col.fqProp);

        return `${colName} AS ${colAlias}`;
      })
      .join(',\n        ');

    // Add the FROM (which includes the JOINS and WHERE).
    sql += '\n';
    sql += this.from.toString();

    // Add the order.
    if (this.order.length) {
      const fromMeta = this.from.getFromMeta();

      sql += '\n';
      sql += 'ORDER BY ';

      sql += this.order
        .map(order => {
          const colMeta = fromMeta.getFromColumnMetaByProp(order.fqProperty);
          const colName = this.escaper.escapeFullyQualifiedColumn(colMeta.fqColName);

          return `${colName} ${order.dir}`;
        })
        .join(', ');
    }

    return sql;
  }

  /**
   * Execute the query and return an array of results of type T.
   * @return A promise that shall be resolved with the normalized query results
   * of type T.  If an error occurs while executing the query, the returned
   * promise shall be rejected with the unmodified error.
   */
  execute(): Promise<T[]> {
    // Base-level schema (e.g. the FROM table).
    let baseSchema: Schema;

    // Schema lookup by table alias.
    const schemaLookup: Map<string, Schema> = new Map();

    // No columns specified.
    assert(this.selectCols.size, 'No columns selected.  Call select().');

    // The primary key for each table is needed to create each schema.  Find
    // each primary key and create the schema.
    const fromMeta     = this.from.getFromMeta();
    const fromTblMetas = fromMeta.getFromTableMeta();

    fromTblMetas
      .forEach(fromTblMeta => {
        const pk = this.colStore.getPrimaryKey(fromTblMeta.tableMetadata.Entity);

        // TODO: Composite keys are not yet implemented.
        assert(pk.length === 1, 'Composite keys are not currently supported.');

        // Create the schema.  In the query, the PK column name will be the
        // fully-qualified property.
        const fqProp  = ColumnMetadata.createFQName(fromTblMeta.alias, pk[0].mapTo);
        const colMeta = this.selectCols.get(fqProp);
        const schema  = new Schema(fromTblMeta.tableMetadata, colMeta.columnMetadata, fqProp);

        // Keep a lookup of table alias->schema.
        schemaLookup.set(fromTblMeta.alias, schema);
        
        // If this table has no parent then the schema is top level.  Else
        // this is a sub schema and the parent is guaranteed to be present in
        // the lookup.
        if (fromTblMeta.parentAlias === null)
          baseSchema = schema;
        else {
          schemaLookup
            .get(fromTblMeta.parentAlias)
            .addSchema(schema, fromTblMeta.relationshipMetadata);
        }
      });

    // Add each column/property to its schema.
    this.selectCols.forEach(fromColMeta => {
      // PK already present.
      if (!fromColMeta.columnMetadata.isPrimary) {
        schemaLookup
          .get(fromColMeta.tableAlias)
          .addColumn(fromColMeta.columnMetadata, fromColMeta.fqProp);
      }
    });

    // Execute the query and map the results.
    const exe = this.buildQuery();

    return this.executer
      .select(exe.query, exe.params)
      .then(result => new DataMapper()
        .serialize<T>(result, baseSchema));
  }

  /**
   * Build the query.
   * @return The string-representation of the query to execute along with query
   * parameters.
   */
  buildQuery(): ExecutableQuery {
    return {
      query: this.toString(),
      params: this.from.getFromMeta().paramList.getParams()
    };
  }
}

