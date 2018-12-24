import { plural } from 'pluralize';
import { camelCase } from 'change-case';

import { CardinalityType } from '../../metadata/';

import { assert } from '../../error/';

import { ModelTable, ModelColumn } from '../';

/**
 * Helper class that store relationship data for the model generator.
 */
export class ModelRelationship {
  private table: ModelTable;
  private referencedTable: ModelTable;
  private columns: ModelColumn[] = [];
  private referencedColumns: ModelColumn[] = [];
  private cardinality: CardinalityType;

  /**
   * Set the local and referenced tables.
   * @param name - The local table name.
   * @param refName - The referenced table name.
   * @param cardinality - How the two tables relate.
   */
  setTables(name: string, refName: string, cardinality: CardinalityType): void {
    this.table = new ModelTable();
    this.table.setName(name);

    this.referencedTable = new ModelTable();
    this.referencedTable.setName(refName);

    this.cardinality = cardinality;
  }

  /**
   * Add a set of columns to join on.
   * @param name - The local column name.
   * @param refName - The referenced column name.
   */
  addColumns(name: string, refName: string): void {
    const column = new ModelColumn();
    column.setName(name);
    this.columns.push(column);

    const refColumn = new ModelColumn();
    refColumn.setName(refName);
    this.referencedColumns.push(refColumn);
  }

  /**
   * Get the local table.
   */
  getLocalTable(): ModelTable {
    assert(this.table, 'ModelRelationship instance has no tables.')

    return this.table;
  }

  /**
   * Get the referenced table.
   */
  getReferencedTable(): ModelTable {
    assert(this.referencedTable, 'ModelRelationship instance has no tables.')

    return this.referencedTable;
  }

  /**
   * Get the local table name.
   */
  getLocalTableName(): string {
    return this.getLocalTable().getClassName();
  }

  /**
   * Get the referenced table name.
   */
  getReferencedClassName(): string {
    return this.getReferencedTable().getClassName();
  }

  /**
   * Get the on part of the decorator string.
   */
  getOnString(): string {
    assert(this.columns.length, 'ModelRelationship instance has no columns.');

    const colSets = [];

    for (let i = 0; i < this.columns.length; ++i) {
      const lProp = this.columns[i].getPropertyName();
      const rProp = this.referencedColumns[i].getPropertyName();

      colSets.push(`[l.${lProp}, r.${rProp}]`);
    }

    if (colSets.length === 1)
      return `(l, r) => ${colSets[0]}`;

    return `(l, r) => [${colSets.join(', ')}]`;
  }

  /**
   * Get the cardinality, which is the name of the decorator.
   */
  getCardinality(): string {
    return this.cardinality;
  }

  /**
   * Get the relationship decorator string.
   */
  getDecoratorString(): string {
    const locTblName  = this.getLocalTableName();
    const refTblName  = this.getReferencedClassName();
    const onString    = this.getOnString();
    const cardinality = this.getCardinality();

    return `  @${cardinality}<${locTblName}, ${refTblName}>(() => ${refTblName}, ${onString})`;
  }

  /**
   * Returns the property string.
   */
  getPropertyString(): string {
    const refTblName  = this.getReferencedClassName();
    const cardinality = this.getCardinality();
    let propName, className;

    if (cardinality === 'OneToMany') {
      propName  = camelCase(plural(this.getReferencedTable().getName()));
      className = `${this.getReferencedClassName()}[]`;
    }
    else {
      propName  = camelCase(this.getReferencedClassName());
      className = this.getReferencedClassName();
    }

    return `  ${propName}: ${className};`;
  }

  /**
   * Convert the relationship to a string (decorator and property).
   */
  toString(): string {
    return this.getDecoratorString() + '\n' + this.getPropertyString();
  }
}

