import { MySQLDataContext } from '../datacontext/';

import { ParameterType } from '../query/';

import {
  TableFormatter, DefaultTableFormatter, MySQLTable, MySQLColumn,
  MySQLKeyColumnUsage, ModelTable, ModelColumn, ModelRelationship,
  MySQLDataTypeMapper, ColumnFormatter, DefaultColumnFormatter,
  RelationshipFormatter, DefaultRelationshipFormatter
} from './';

/**
 * Model generator for MySQL.
 */
export class MySQLModelGenerator {
  /**
   * Initialize the model generator.
   * @param dataContext - A [[MySQLDataContext]] instance that is connected to
   * the INFORMATION_SCHEMA database.  It's used to select metadata about
   * tables, columns, and constraints.
   * @param tableFormatter - A [[TableFormatter] instance that is used to
   * format the names of generated class entities.
   * @param columnFormatter - A [[ColumnFormatter]] instance that is used for
   * formatting property names in the generated class entities.
   * @param relFormatter - A [[RelationshipFormatter]] instances that is used
   * to format relationship property names.
   */
  constructor(
    private dataContext: MySQLDataContext,
    private tableFormatter: TableFormatter = new DefaultTableFormatter(),
    private columnFormatter: ColumnFormatter = new DefaultColumnFormatter(),
    private relFormatter: RelationshipFormatter = new DefaultRelationshipFormatter()) {
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
    const modelTables: Map<string, ModelTable> = new Map();

    const tables = await this.dataContext
      .from(MySQLTable, 't')
      .innerJoin(MySQLColumn, 'c', 't.columns')
      .leftOuterJoin(MySQLKeyColumnUsage, 'k', 'c.keyColumnUsage')
      .where({$eq: {'t.schema': ':db'}}, {db: dbName})
      .select()
      .orderBy('t.name', 'c.name', 'k.constraintName')
      .execute();

    for (let table of tables) {
      // Create a model for each table.
      const modelTable = new ModelTable(this.tableFormatter);

      modelTable.setName(table.name);
      modelTables.set(table.name, modelTable);

      // Add each column to the table.
      for (let column of table.columns) {
        const modelCol = new ModelColumn(this.columnFormatter);

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
    }

    // Keys are nested under table->column.
    // Foreign keys have a referenced table name.
    const fks: MySQLKeyColumnUsage[] = tables
      .reduce((cols: MySQLColumn[], table: MySQLTable) => cols.concat(table.columns), [])
      .reduce((keys: MySQLKeyColumnUsage[], col: MySQLColumn) =>
        keys.concat(col.keyColumnUsage), [])
      .filter((key: MySQLKeyColumnUsage) => key.referencedTableName);

    for (let locTable of modelTables.values()) {
      // A relationship constraint may span multiple columns.  Also,
      // relationships may be self-referencing, in which case the local and
      // referenced tables are the same.  When looping over keys and adding
      // relationships, this set is used to skip already-seen constraints.
      const constraints: Set<string> = new Set();

      // These are the relationships that this table owns.
      const ownRelations = fks
        .filter(key => key.tableName === locTable.getName());

      for (let rel of ownRelations) {
        if (!constraints.has(rel.constraintName)) {
          const refTable = modelTables.get(rel.referencedTableName);
          const modelRel = new ModelRelationship(this.relFormatter);

          modelRel.setTables(locTable, refTable, 'ManyToOne');

          // The constraint may use multiple columns.  Add each set.
          ownRelations
            .filter(oRel => oRel.constraintName === rel.constraintName)
            .forEach(rel => modelRel
              .addColumns(
                locTable.getColumnByName(rel.columnName),
                refTable.getColumnByName(rel.referencedColumnName)));

          constraints.add(rel.constraintName);
          locTable.addRelationship(modelRel);
        }
      }

      // These are the relationships that reference this table.
      const refRelations = fks
        .filter(key => key.referencedTableName === locTable.getName());

      for (let rel of refRelations) {
        if (!constraints.has(rel.constraintName)) {
          const refTbl   = modelTables.get(rel.tableName);
          const modelRel = new ModelRelationship(this.relFormatter);

          modelRel.setTables(locTable, refTbl, 'OneToMany');

          // The constraint may use multiple columns.  Add each set.
          refRelations
            .filter(oRel => oRel.constraintName === rel.constraintName)
            .forEach(rel => modelRel
              .addColumns(
                locTable.getColumnByName(rel.referencedColumnName),
                refTbl.getColumnByName(rel.columnName)));

          constraints.add(rel.constraintName);
          locTable.addRelationship(modelRel);
        }
      }
    }

    const modelStrings = Array.from(modelTables.values())
      .map(tbl => tbl.toString());

    return modelStrings;
  }
}

