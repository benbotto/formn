import { ColumnMetadata } from '../metadata/column/column-metadata';
import { TableMetadata } from '../metadata/table/table-metadata';
import { SubSchema } from './sub-schema';
import { assert } from '../error/assert';
import { RelationshipMetadata } from '../metadata/relationship/relationship-metadata';

/**
 * A Schema is a representation of a serializable database table, consisting of
 * a series of columns and [[SubSchema]] objects.  It's used when mapping a
 * query to a normalized document.  The mapping is defined using
 * [[TableMetadata]], [[ColumnMetadata]], and [[RelationshipMetadata]].
 */
export class Schema {
  // Used to verify that the same property is not added twice.
  private propertyLookup: Set<string> = new Set();

  /**
   * All the [[SubSchema]] instances of this schema.
   */
  public schemata: SubSchema[] = [];

  /**
   * All the [[ColumnMetadata]] objects (columns of the table) that will
   * be mapped in the resulting document.
   */
  public columns: ColumnMetadata[] = [];

  /**
   * Initialize the Schema instance.  Note that the properties are treated as
   * package private: they're accessed directly by DataMapper which provides an
   * efficiency boost, and speed is important here.
   * @param table - Metadata for the [[Table]]-decorated Entity.  This is used
   * to produce an instance of the Entity.
   * @param keyColumn - Metadata for the unique column in the table, generally
   * the primary key.  The metadata comes from a [[Column]]-decorated property
   * of a [[Table]]-decorated class and has the name of the column, the
   * property in the Entity, and an optional [[Converter]].
   */
  constructor(
    public table: TableMetadata,
    public keyColumn: ColumnMetadata) {

    this.addColumn(this.keyColumn);
  }

  /**
   * Add a column to the schema.
   * @param column - Metadata for the column.  The metadata comes from a
   * [[Column]]-decorated property of a [[Table]]-decorated class and has the
   * name of the column, the property in the Entity, and an optional
   * [[Converter]].
   */
  addColumn(column: ColumnMetadata): Schema {
    // The property names must be unique.
    assert(!this.propertyLookup.has(column.mapTo),
      `Property "${column.mapTo}" already present in schema.`);
    this.propertyLookup.add(column.mapTo);

    this.columns.push(column);

    return this;
  }

  /**
   * Short-hand notation for adding [[ColumnMetadata]].
   * @param columns - A series of Columns to be added to the Schema.
   */
  addColumns(...columns: ColumnMetadata[]): Schema {
    columns.forEach(col => this.addColumn(col));

    return this;
  }

  /**
   * Add a [[SubSchema]], which is a related [[Table]]-decorated Entity and
   * will be nested under this Schema using the [[RelationshipMetadata]].
   * @param schema - A Schema instance that will be mapped.
   * @param relationship - Relationship metadata for the relationship between
   * this Schema and the sub-Schema.  The relationship must be from this
   * Schema's [[Table]] to the sub-Schema's [[Table]].
   * @param {Schema} schema - A Schema instance.
   */
  addSchema(schema: Schema, relationship: RelationshipMetadata): Schema {
    // The property names must be unique.
    assert(!this.propertyLookup.has(relationship.mapTo),
      `Property "${relationship.mapTo}" already present in schema.`);
    this.propertyLookup.add(relationship.mapTo);

    // The relationship must be from this Entity.
    assert(this.table.Entity === relationship.Entity,
      `Schema relationship Entity must be "${this.table.Entity.name}" but "${relationship.Entity.name}" provided.`);

    this.schemata.push(new SubSchema(schema, relationship));

    return this;
  }
}
