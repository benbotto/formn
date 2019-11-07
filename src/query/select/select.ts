import { assert } from '../../error/';

import { ColumnStore, PropertyMapStore, ColumnMetadata } from '../../metadata/';

import { Schema, DataMapper } from '../../datamapper/';

import { Query, Escaper, Executer, From, FromTableMeta, FromColumnMeta,
  OrderByType, OrderBy, ExecutableQuery } from '../';

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
   * @param isDistinct - Set to true to make the resultset distinct.
   */
  constructor(
    protected colStore: ColumnStore,
    protected escaper: Escaper,
    protected executer: Executer,
    protected from: From,
    protected order: OrderBy,
    protected isDistinct: boolean = false) {

    super();
  }

  /**
   * Helper function to check if the primary key column(s) of a table
   * is selected.
   */
  protected isPrimaryKeySelected(fromTblMeta: FromTableMeta): boolean {
    const basePK = this.colStore
      .getPrimaryKey(fromTblMeta.tableMetadata.Entity);

    return basePK
      .every(pk => {
        const pkAlias = ColumnMetadata
          .createFQName(fromTblMeta.alias, pk.mapTo);

        return this.selectCols.has(pkAlias);
      });
  }

  /**
   * Select columns.  If not columns are supplied then the columns from every
   * table are selected.
   *
   * This method can only be called once or an exception is raised.
   *
   * Each column can only be selected a single time.
   *
   * The primary key of the base table (the FROM'd table) is required.
   *
   * If a column from a table is selected, then the primary key is also required.
   *
   * If a column from a table is selected, then its parent's primary key is
   * also required, and all its ancestors' primary keys are required.
   *
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

    const [baseFromTblMeta, ...joinFromTblMetas] = fromMeta.getFromTableMeta();

    // The primary key of the base table is always required.  It's needed
    // to serialize the results since it's the top-level serialized entity
    // that's returned from execute().
    assert(this.isPrimaryKeySelected(baseFromTblMeta),
      'The primary key of the base table must be selected, but the primary ' +
      `key of table "${baseFromTblMeta.tableMetadata.getFQName()}" ` +
      `(alias "${baseFromTblMeta.alias}") was not selected.`);

    // This is a set of all the table aliases that have selected columns (e.g.
    // that need to be serialized when the query is executed).
    const selTblAliases = new Set();

    for (const fromColMeta of this.selectCols.values())
      selTblAliases.add(fromColMeta.tableAlias);

    // This loops over all joined-in tables that have at least one column
    // selected.
    joinFromTblMetas
      .filter(fromTblMeta => selTblAliases.has(fromTblMeta.alias))
      .forEach(fromTblMeta => {
        const tblAlias = fromTblMeta.alias;

        // If a column is selected from a table then the primary key must
        // also be selected.  The serialization needs a way to uniquely
        // identify each serialized entity; the primary key is used.
        assert(this.isPrimaryKeySelected(fromTblMeta),
          'If a column is selected from a table then the primary key of ' +
          'that table must also be selected; however, the primary key of ' +
          `table "${fromTblMeta.tableMetadata.getFQName()}" (alias ` +
          `"${tblAlias}") was not selected.`);

        // If a column is selected then the parent must be present;
        // otherwise, there is nothing to map the entity onto.  This
        // traverses from the current table all the way to the base (FROM)
        // table and checks that the primary key is present on each ancestor.
        // Ex: When selecting from users->users_x_products->products, if
        // something from products is selected then both users_x_products'
        // and users' primary keys are required.
        let parentAlias = fromTblMeta.parentAlias;
        const traversal = [tblAlias];

        while (parentAlias) {
          const parentFromTblMeta = fromMeta.getFromTableMetaByAlias(parentAlias);

          traversal.push(parentAlias);

          assert(this.isPrimaryKeySelected(parentFromTblMeta),
            'The primary key of table ' +
            `"${parentFromTblMeta.tableMetadata.getFQName()}" ` +
            `(alias "${parentAlias}") must be selected because it is an ` +
            `ancestor of table "${fromTblMeta.tableMetadata.getFQName()}" ` +
            `(alias "${tblAlias}").  Traversal: ${traversal.reverse().join('<-')}.`);

          parentAlias = parentFromTblMeta.parentAlias;
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
   * Make the query distinct.
   */
  distinct(): this {
    this.isDistinct = true;

    return this;
  }

  /**
   * Get the SELECT portion of the query string.
   */
  getSelectString(): string {
    let sql = 'SELECT  ';

    if (this.isDistinct)
      sql += 'DISTINCT\n        ';

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
   * @return A Promise that shall be resolved with the normalized query results
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

    // Each table referenced by selected columns will be serialized.  This is
    // a set of all the table aliases that have selected columns.
    const selTblAliases = new Set();

    for (const fromColMeta of this.selectCols.values())
      selTblAliases.add(fromColMeta.tableAlias);

    // These are the FromTableMetas that need to be serialized (the ones that
    // have a column selected).
    const fromTblMetas = this.from
      .getFromMeta()
      .getFromTableMeta()
      .filter(fromTblMeta => selTblAliases.has(fromTblMeta.alias));

    // Create a Schema for each table that has columns selected.  The primary
    // key is used to create the Schema since it uniquely identifies each table.
    // The PK is guaranteed to be selected (see select()).
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

        // If this table has no parent then the schema is top level.  Else this
        // is a sub schema and the parent is guaranteed to be present in the
        // lookup because Map values are in insertion order and the tables are
        // joined in order.
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

