import { CardinalityType } from '../../metadata/';

import { assert } from '../../error/';

import { ModelTable, ModelColumn, RelationshipFormatter } from '../';

/**
 * Helper class that store relationship data for the model generator.
 */
export class ModelRelationship {
  private localTable: ModelTable;
  private referencedTable: ModelTable;
  private columns: ModelColumn[][] = [];
  private cardinality: CardinalityType;

  /**
   * Initialize the relationship.
   * @param relFormatter - A [[RelationshipFormatter]] instances that is used
   * to format relationship property names.
   */
  constructor(
    private relFormatter: RelationshipFormatter) {
  }

  /**
   * Set the local and referenced tables.
   * @param localTable - The [[ModelTable]] to which this relationship belongs.
   * @param referencedTable - The [[ModelTable]] that the relationship references.
   * @param cardinality - How the two tables relate.
   */
  setTables(
    localTable: ModelTable,
    referencedTable: ModelTable,
    cardinality: CardinalityType): this {

    this.localTable      = localTable;
    this.referencedTable = referencedTable;
    this.cardinality     = cardinality;

    return this;
  }

  /**
   * Add a set of columns to join on.
   * @param localColumn - The [[ModelColumn]] used in this relationship that is
   * owned by the local [[ModelTable]].
   * @param referencedColumn - The [[ModelColumn]] that is referenced in the
   * foreign [[ModelTable]].
   */
  addColumns(localColumn: ModelColumn, referencedColumn: ModelColumn): this {
    this.columns.push([localColumn, referencedColumn]);

    return this;
  }

  /**
   * Get the array of columns.  Each entry in the array has two [[ModelColumn]]
   * instances: one for the local column, one for the remote column.
   */
  getColumns(): ModelColumn[][] {
    return this.columns;
  }

  /**
   * Get the local table.
   */
  getLocalTable(): ModelTable {
    assert(this.localTable, 'ModelRelationship instance has no tables.');

    return this.localTable;
  }

  /**
   * Get the referenced table.
   */
  getReferencedTable(): ModelTable {
    assert(this.referencedTable, 'ModelRelationship instance has no tables.')

    return this.referencedTable;
  }

  /**
   * Get the local table's class name.
   */
  getLocalClassName(): string {
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

    const colSets = this.columns
      .map(([local, remote]) => {
        const lProp = local.getPropertyName();
        const rProp = remote.getPropertyName();

        return `[l.${lProp}, r.${rProp}]`;
      });

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
    const locTblName  = this.getLocalClassName();
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
    const propName    = this.relFormatter.formatPropertyName(this);
    const className   = cardinality === 'OneToMany' ?
      `${this.getReferencedClassName()}[]` :
      this.getReferencedClassName();

    return `  ${propName}: ${className};`;
  }

  /**
   * Convert the relationship to a string (decorator and property).
   */
  toString(): string {
    return this.getDecoratorString() + '\n' + this.getPropertyString();
  }
}

