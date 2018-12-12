import { assert } from '../error/assert';

import { DataContext } from './data-context';

import { EntityType } from '../metadata/table/entity-type';

import { MySQLEscaper } from '../query/escaper/mysql-escaper';
import { MySQLExecuter } from '../query/executer/mysql-executer';
import { MySQLFromAdapter } from '../query/from/mysql-from-adapter';

import { ConnectionOptions } from '../connection/connection-options';
import { MySQLConnectionManager } from '../connection/mysql-connection-manager';
import { MySQLUpdateModel } from '../query/update/mysql-update-model';

/**
 * A [[DataContext]] class specialized for MySQL.
 */
export class MySQLDataContext extends DataContext {
  /**
   * Used for executing queries.
   */
  protected executer: MySQLExecuter;

  /**
   * Used for escaping queries.
   */
  protected escaper: MySQLEscaper;

  /**
   * Manages the connection pool.
   */
  protected connMan: MySQLConnectionManager;

  /**
   * Initialize the [[DataContext]].
   */
  constructor() {
    super();

    this.escaper  = new MySQLEscaper();
    this.executer = null; // Initialized in connect().
    this.connMan  = new MySQLConnectionManager();
  }

  /**
   * Get a [[MySQLExecuter]] instance that can be used to execute queries.
   */
  getExecuter(): MySQLExecuter {
    assert(this.connMan.getConnectionState() === 'CONNECTED',
      'MySQLDataContext.getExecuter() called before connect().');

    return this.executer;
  }

  /**
   * Get a [[MySQLEscaper]] instance for escaping column and table names.
   */
  getEscaper(): MySQLEscaper {
    return this.escaper;
  }

  /**
   * Create a new [[MySQLFromAdapter]] instance, which can then be used to
   * select, update, or delete.
   * @param Entity - A [[Table]]-decorated entity which is the constructor of
   * the FROM table.
   * @param alias - Alias for the FROM table, used in conditions, joins,
   * and column selection.  Optional: defaults to the name of the table.
   * @return A [[MySQLFromAdapter]] that implements [[MySQLFromAdapter.select]],
   * [[MySQLFromAdapter.update]], and [[MySQLFromAdapter.delete]].
   */
  from<T>(Entity: EntityType<T>, alias: string): MySQLFromAdapter<T> {
    return new MySQLFromAdapter(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.getEscaper(), this.getExecuter(), Entity, alias);
  }

  /**
   * Create a new [[MySQLUpdateModel]] instance that can be used to update a
   * model by ID.  For complex update operations, use the
   * [[MySQLDataContext.from]] method to obtain a [[MySQLFromAdapter]]
   * instance, and then call [[MySQLFromAdapter.update]] on that instance.
   * @param Entity - The type of model to update, which is the constructor of a
   * [[Table]]-decorated class.
   * @param model - An Entity instance to update, which must have the primary
   * key set.
   * @return An [[MySQLUpdateModel]] instance that can be executed using
   * [[MySQLUpdateModel.execute]].
   */
  update<T>(Entity: EntityType<T>, model: T): MySQLUpdateModel<T> {
    return new MySQLUpdateModel(this.colStore, this.tblStore, this.relStore,
      this.propStore, this.getEscaper(), this.getExecuter(), Entity, model);
  }

  /**
   * Connect to the database.
   * @param connOpts - Connection options for setting up a connection to the
   * database.
   * @return A promise that will be resolved with this [[MySQLDataContext]]
   * instance.
   */
  connect(connOpts: ConnectionOptions): Promise<this> {
    return this.connMan
      .connect(connOpts)
      .then(conn => {
        this.executer = new MySQLExecuter(conn);

        return this;
      });
  }

  /**
   * End the connection pool.
   */
  end(): Promise<void> {
    return this.connMan
      .end();
  }
}

