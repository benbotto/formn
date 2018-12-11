import { assert } from '../../error/assert';

import { ColumnStore } from '../../metadata/column/column-store';
import { TableStore } from '../../metadata/table/table-store';
import { RelationshipStore } from '../../metadata/relationship/relationship-store';
import { PropertyMapStore } from '../../metadata/property/property-map-store';
import { ColumnMetadata } from '../../metadata/column/column-metadata';
import { EntityType } from '../../metadata/table/entity-type';

import { ParameterType } from '../condition/parameter-type';
import { ParameterList } from '../condition/parameter-list';

import { Escaper } from '../escaper/escaper';
import { Executer } from '../executer/executer';
import { Query } from '../query';
import { ExecutableQuery } from '../executable-query';

/**
 * A [[Query]] class that represents an INSERT query.  Instances of the class
 * can be used to insert models in a database.
 */
export class Insert<T> extends Query {
  // These are all the columns in the model that need to be inserted.
  private insertCols: ColumnMetadata[];

  // These are all the parameters used in the insert.
  private paramList: ParameterList;

  /**
   * Initialize the Query.
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
   * @param Entity - The type of model to insert, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to insert.
   */
  constructor(
    protected colStore: ColumnStore,
    protected tblStore: TableStore,
    protected relStore: RelationshipStore,
    protected propStore: PropertyMapStore,
    protected escaper: Escaper,
    protected executer: Executer,
    private Entity: EntityType<T>,
    private model: T) {

    super(colStore, tblStore, relStore, propStore, escaper, executer);

    this.storeInsertCols();
    this.storeParameters();
  }

  /**
   * Store all the insert columns in an array for use in buildQuery and
   * toString.
   */
  private storeInsertCols(): void {
    // Metadata for all the columns in the table from the Column decorator.
    const colMetas = this.colStore.getColumnMetadata(this.Entity);

    // If the model has the column property then it's included in the insert.
    // Note that the check has to explicitly be for undefined: null is a
    // legitimate value.
    this.insertCols = colMetas
      .filter(colMeta => (this.model as ParameterType)[colMeta.mapTo] !== undefined);
  }

  /**
   * Store all the parameters in an array for use in buildQuery, toString, and
   * execute.
   */
  private storeParameters(): void {
    this.paramList = new ParameterList();

    this.insertCols
      .forEach(colMeta => {
        const paramName = colMeta.mapTo;
        let   paramVal  = (this.model as ParameterType)[colMeta.mapTo];

        if (colMeta.converter && colMeta.converter.onSave)
          paramVal = colMeta.converter.onSave(paramVal);

        this.paramList
          .addParameter(paramName, paramVal);
      });
  }

  /**
   * Create the SQL string.
   * @return A SQL representation of the INSERT query as a string.
   */
  toString(): string {
    // Metadata for the table from the Table decorator.
    const tblMeta  = this.tblStore.getTable(this.Entity);

    // If there are no coluns then there is nothing to insert.
    if (this.insertCols.length === 0)
      return '';

    // Build the sql.
    const tblName = this.escaper.escapeFullyQualifiedColumn(tblMeta.getFQName());
    let sql = `INSERT INTO ${tblName} (`;

    sql += this.insertCols
      .map(colMeta => this.escaper.escapeProperty(colMeta.name))
      .join(', ');
    sql += ')\n';

    sql += 'VALUES (';
    sql += this.paramList
      .getParamNames()
      .map(pName => `:${pName}`)
      .join(', ');
    sql += ')';

    return sql;
  }

  /**
   * Build the query.
   * @return An [[ExecutableQuery]] with the query string and any parameters
   * usded in the query.
   */
  buildQuery(): ExecutableQuery {
    return {
      query: this.toString(),
      params: this.paramList.getParams()
    };
  }

  /**
   * Execute the query.
   * @return A Promise that shall be resolved with the model.  If the
   * [[Executer.insert]] operation returns a generated insertId the model will
   * be updated with that ID.  If an error occurs during execution the promise
   * shall be rejected with the unmodified error.
   */
  execute(): Promise<T> {
    const exe = this.buildQuery();

    if (exe.query === '')
      return Promise.resolve(this.model);

    return this.executer
      .insert(exe.query, exe.params)
      .then(result => {
        // If a generated ID is returned then set it on the model.
        if (result.insertId !== undefined) {
          const pk = this.colStore.getPrimaryKey(this.Entity);

          // TODO: Composite keys are not yet implemented.
          assert(pk.length === 1, 'Composite keys are not currently supported.');

          (this.model as ParameterType)[pk[0].mapTo] = result.insertId;
        }

        return this.model;
      });
  }
}

