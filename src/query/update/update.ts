import { assert } from '../../error/';

import { ColumnStore, TableStore, RelationshipStore, PropertyMapStore } from '../../metadata/';

import { UpdateType, ParameterList, Query, Escaper, Executer, From,
  FromColumnMeta, ExecutableQuery, MutateResultType } from '../';

/**
 * A [[Query]] that represents an UPDATE.
 */
export abstract class Update extends Query {
  // These are all the columns in the model that need to be updated.
  protected updateCols: FromColumnMeta[];

  // These are all the parameters used in the update.
  protected paramList: ParameterList;

  // This is a lookup of fully-qualified property to parameter name.
  protected paramLookup: Map<string, string>;

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
    protected escaper: Escaper,
    protected executer: Executer,
    protected from: From,
    protected model: UpdateType) {

    super(colStore, tblStore, relStore, propStore, escaper, executer);

    this.storeUpdateCols();
    this.storeParameters();
  }

  /**
   * Store all the update columns in an array for use in buildQuery and
   * toString.
   */
  private storeUpdateCols(): void {
    const fromMeta = this.from.getFromMeta();

    this.updateCols = [];

    for (let fqProp in this.model) {
      assert(fromMeta.isColumnAvailable(fqProp),
        `Column "${fqProp}" is not available for updating.`);
      
      this.updateCols.push(fromMeta.getFromColumnMetaByProp(fqProp));
    }
  }

  /**
   * Store all the parameters in an array for use in buildQuery, toString, and
   * execute.
   */
  private storeParameters(): void {
    // Initialize the parameter list using any parameters in the underlying
    // From instance.
    this.paramList = new ParameterList(
      this.from.getFromMeta().paramList);

    // Lookup from prop to generated param name.
    this.paramLookup = new Map();

    this.updateCols
      .forEach(fromColMeta => {
        const colMeta   = fromColMeta.columnMetadata;
        const paramName = this.paramList.createParameterName(fromColMeta.fqProp);
        let   paramVal  = this.model[fromColMeta.fqProp];

        if (colMeta.converter && colMeta.converter.onSave)
          paramVal = colMeta.converter.onSave(paramVal);

        this.paramList
          .addParameter(paramName, paramVal);

        this.paramLookup
          .set(fromColMeta.fqProp, paramName);
      });
  }

  /**
   * Build the query.
   * @return The string-representation of the query to execute along with query
   * parameters.
   */
  buildQuery(): ExecutableQuery {
    return {
      query: this.toString(),
      params: this.paramList.getParams()
    };
  }

  /**
   * Execute the query.
   * @return A promise that shall be resolved with an object containing an
   * "affectedRows" property.  If an error occurs when executing the query, the
   * returned promise shall be rejected with the error (unmodified).
   */
  execute(): Promise<MutateResultType> {
    const exe = this.buildQuery();

    if (exe.query === '')
      return Promise.resolve({affectedRows: 0});

    return this.executer
      .update(exe.query, exe.params);
  }
}

