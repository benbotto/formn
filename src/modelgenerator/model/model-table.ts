import { singular } from 'pluralize';
import { pascalCase, paramCase as kebabCase } from 'change-case';

import { assert } from '../../error/';

import { TableMetaOptions } from '../../metadata/';

import { ModelColumn, ModelRelationship } from '../';

/**
 * Helper class for model generation that has metadata about a model.
 */
export class ModelTable {
  private metaOptions: TableMetaOptions = new TableMetaOptions();
  private formnImports: Set<string> = new Set(['Table', 'Column']);
  private columns: ModelColumn[] = [];
  private relationships: ModelRelationship[] = [];

  /**
   * Get the name of the table.
   */
  getName(): string {
    assert(this.metaOptions.name, 'ModelTable instance has no name.');

    return this.metaOptions.name;
  }

  /**
   * Get the formatted name of the table, which is pascal case and singular.
   */
  getClassName(): string {
    return pascalCase(singular(this.getName()));
  }

  /**
   * Get the import name of this class.
   */
  getImportName(): string {
    return kebabCase(singular(this.getName())) + '.entity';
  }

  /**
   * Get the import file name of this class.
   */
  getImportFileName(): string {
    return `${this.getImportName()}.ts`;
  }

  /**
   * Set the name of the table.
   */
  setName(name: string): void {
    this.metaOptions.name = name;
  }

  /**
   * The table schema for databases that have schemas.
   */
  getSchema(): string {
    return this.metaOptions.schema;
  }

  /**
   * Set the schema.
   */
  setSchema(schema: string): void {
    this.metaOptions.schema = schema;
  }

  /**
   * Add a column to the table.
   */
  addColumn(col: ModelColumn): this {
    this.columns.push(col);

    return this;
  }

  /**
   * Add a relationship to the table.
   */
  addRelationship(rel: ModelRelationship): this {
    this.relationships.push(rel);

    // The cardinality of the relationship is a decorator, so an import is
    // needed.
    this.formnImports.add(rel.getCardinality());

    return this;
  }

  /**
   * Get the formn imports as a string.
   */
  getFormnImportsString(): string {
    const imports = Array.from(this.formnImports.values());
    return `import { ${imports.join(', ')} } from 'formn';`;
  }

  /**
   * Get the model imports string, which may be empty.
   */
  getModelImportsString(): string {
    if (this.relationships.length === 0)
      return '';

    return this.relationships
      .map(rel => rel.getReferencedTable())
      .map(refTbl => `import { ${refTbl.getClassName()} } from './${refTbl.getImportName()}';`)
      .join('\n');
  }

  /**
   * Get the metadata as a [[Table]] decorator string.
   */
  getDecoratorString(): string {
    const name   = this.getName();
    const cName  = this.getClassName();
    const schema = this.getSchema();
    const opts   = [];

    if (name && name !== cName)
      opts.push(`name: '${name}'`);

    if (schema)
      opts.push(`schema: '${schema}'`);

    if (opts.length)
      return `@Table({${opts.join(', ')}})`;

    return '@Table()';
  }

  /**
   * Get the class definition string (brackets not included).
   */
  getClassString(): string {
    const className = this.getClassName();

    return `export class ${className}`;
  }

  /**
   * Get a string representation of the model.
   */
  toString(): string {
    let modelStr = this.getFormnImportsString() + '\n\n';

    let modelImports = this.getModelImportsString();

    if (modelImports)
      modelStr += modelImports + '\n\n';

    modelStr += this.getDecoratorString() + '\n';
    modelStr += this.getClassString() + ' {\n';

    modelStr += this.columns
      .map(col => col.toString())
      .join('\n\n');

    if (this.relationships.length) {
      modelStr += '\n\n';

      modelStr += this.relationships
        .map(rel => rel.toString())
        .join('\n\n');
    }

    modelStr += '\n}\n';

    return modelStr;
  }
}

