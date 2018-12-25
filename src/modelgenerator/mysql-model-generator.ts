import { MySQLDataContext } from '../datacontext/';

import { ParameterType } from '../query/';

import { Table, Column, KeyColumnUsage, ModelTable, ModelColumn, 
  ModelRelationship, MySQLDataTypeMapper } from './';

/**
 * Model generator for MySQL.
 */
export class MySQLModelGenerator {
  /**
   * Initialize the model generator.
   * @param dataContext - A [[MySQLDataContext]] instance that is connected to
   * the INFORMATION_SCHEMA database.  It's used to select metadata about
   * tables, columns, and constraints.
   */
  constructor(
    private dataContext: MySQLDataContext) {
  }

  /**
   * Generate models for the provided database and write each to a file.
   * @param modelDirPath - The path to an entity folder to which entities
   * should be written.
   * @param dbName - A database name.  A model will be generated for each table
   * in the database.
   */
  async generateModels(modelDirPath: string, dbName: string): Promise<string[]> {
    // Map of table name to ModelTable.
    const modelTables: ModelTable[] = [];

    const tables = await this.dataContext
      .from(Table, 't')
      .innerJoin(Column, 'c', 't.columns')
      .leftOuterJoin(KeyColumnUsage, 'k', 'c.keyColumnUsage')
      .where({$eq: {'t.schema': ':db'}}, {db: dbName})
      .select()
      .orderBy('t.name', 'c.name', 'k.constraintName')
      .execute();

    // Keys are nested under table->column.
    // Foreign keys have a referenced table name.
    const fks: KeyColumnUsage[] = tables
      .reduce((cols: Column[], table: Table) => cols.concat(table.columns), [])
      .reduce((keys: KeyColumnUsage[], col: Column) =>
        keys.concat(col.keyColumnUsage), [])
      .filter((key: KeyColumnUsage) => key.referencedTableName);

    for (let table of tables) {
      // Create a model for each table.
      const modelTable = new ModelTable();

      modelTable.setName(table.name);
      modelTables.push(modelTable);

      // Add each column to the table.
      for (let column of table.columns) {
        const modelCol = new ModelColumn();

        modelCol
          .setDataType(MySQLDataTypeMapper
            .getJSType(column.dataType, column.columnType));
        modelCol.setName(column.name);
        modelCol.setIsPrimary(column.isPrimary);
        modelCol.setMaxLength(column.maxLength);
        modelCol.setHasDefault(column.hasDefault);
        modelCol.setIsNullable(column.isNullable);
        modelCol.setIsGenerated(column.isGenerated);

        modelTable.addColumn(modelCol);
      }

      // A constraint may span multiple columns.  When looping over keys and
      // adding relationships, this set is used to skip already-seen constraints.
      const constraints: Set<string> = new Set();

      // These are the relationships that this table owns.
      const ownRelations = fks
        .filter(key => key.tableName === table.name);

      for (let rel of ownRelations) {
        if (!constraints.has(rel.constraintName)) {
          const modelRel = new ModelRelationship();

          modelRel.setTables(rel.tableName, rel.referencedTableName, 'ManyToOne');

          // The constraint may use multiple columns.  Add each set.
          ownRelations
            .filter(oRel => oRel.constraintName === rel.constraintName)
            .forEach(rel => modelRel.addColumns(rel.columnName, rel.referencedColumnName));

          constraints.add(rel.constraintName);
          modelTable.addRelationship(modelRel);
        }
      }

      // These are the relationships that reference this table.
      const refRelations = fks
        .filter(key => key.referencedTableName === table.name);

      for (let rel of refRelations) {
        if (!constraints.has(rel.constraintName)) {
          const modelRel = new ModelRelationship();

          modelRel.setTables(rel.referencedTableName, rel.tableName, 'OneToMany');

          // The constraint may use multiple columns.  Add each set.
          refRelations
            .filter(oRel => oRel.constraintName === rel.constraintName)
            .forEach(rel => modelRel.addColumns(rel.referencedColumnName, rel.columnName));

          constraints.add(rel.constraintName);
          modelTable.addRelationship(modelRel);
        }
      }
    }

    const modelStrings = modelTables
      .map(tbl => tbl.toString());

    return modelStrings;
  }
}

