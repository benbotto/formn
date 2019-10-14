import { assert } from '../../error/';

import { ColumnStore, PropertyMapStore, ColumnMetadata } from '../../metadata/';

import { Schema, DataMapper } from '../../datamapper/';

import { Query, Escaper, Executer, From, FromColumnMeta, OrderByType, OrderBy,
  ExecutableQuery } from '../';

/**
 * Represents a SELECT query.
 */
export abstract class Select<T> extends Query {
  // These are the columns that the user selected, by fully-qualified property.
  // It's a map from property name to FromColumnMeta.
  protected selectCols: Map<string, FromColumnMeta> = new Map();

  // Optional row offset and limit.
  protected offset: number;
  protected rowCount: number;

  /**
   * Initialize the query using a From instance.
   * @param colStore - Used for accessing columns in tables.
   * @param escaper - An [[Escaper]] matching the database type (e.g.
   * [[MySQLEscaper]] or [[MSSQLEscaper]]).  Used when escaping column names in
   * compiled conditions.
   * @param executer - An [[Executer]] instance that matches the database type
   * (e.g. [[MySQLExecuter]]).
   * @param from - A [[From]] instance which holds the base table, all
   * joined-in tables, and the where clause.
   * @param order - An [[OrderBy]] instance which is optionally used to order
   * the query results.
   */
  constructor(
    protected colStore: ColumnStore,
    protected escaper: Escaper,
    protected executer: Executer,
    protected from: From,
    protected order: OrderBy) {

    super();
  }

  /**
   * Select columns manually.
   * @param cols - An optional set of columns to select.  Each argument should
   * be a fully-qualified property name in the form
   * &lt;table-alias&gt;.&lt;property&gt;.  If no columns are specified, then
   * all columns are selected.
   */
  select(...cols: string[]): this {
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
  orderBy(...orders: OrderByType[] | string[]): this {
    this.order.orderBy(...orders);

    return this;
  }

  /**
   * Limit the number of rows returned.
   * @param rowCount - The number of rows to return.
   */
  limit(rowCount: number): this;

  /**
   * Limit the number of rows returned with an offset.
   * @param offset - The start index of the first row to return.
   * @param rowCount - The number of rows to return.
   */
  limit(limitOrOffset: number, rowCount: number): this;

  /**
   * Limit the number of rows returned.
   * @param offset - The start index of the first row to return.
   * @param rowCount - The number of rows to return.
   */
  limit(limitOrOffset: number, rowCount?: number): this {
    if (rowCount === undefined) {
      this.offset   = 0;
      this.rowCount = limitOrOffset;
    }
    else {
      this.offset   = limitOrOffset;
      this.rowCount = rowCount;
    }

    // These values are used in SQL directly, so there's an extract type
    // saftey check to prevent SQL injection.
    assert(typeof this.offset === 'number', 'offset must be a number');
    assert(typeof this.rowCount === 'number', 'rowCount must be a number');

    return this;
  }

  /**
   * Get the SELECT portion of the query string.
   */
  getSelectString(): string {
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
        const pks = this.colStore.getPrimaryKey(fromTblMeta.tableMetadata.Entity);

        // Create the schema.  In the query, the PK column name(s) will be the
        // fully-qualified property.
        const fqProps = pks
          .map(pk => ColumnMetadata.createFQName(fromTblMeta.alias, pk.mapTo));
        const colMetas = fqProps
          .map(fqProp => this.selectCols.get(fqProp).columnMetadata);
        const schema  = new Schema(fromTblMeta.tableMetadata, colMetas, fqProps);

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

