import { Schema } from './schema';

type LookupType = {[key: string]: any};
type QueryRowType = LookupType;

/**
 * Class that serializes a [[Schema]] instance in to a normalized document (a
 * series of [[Table]]-decorated Entities).
 */
export class DataMapper {
  /**
   * Serialize the query into the an array of objects, as defined by schema.
   * @param query - A set of query results, which is an array of objects
   * containing keys as properties and values from a database query.
   * @param schema - The [[Schema]] instance describing how to serialize the
   * query.
   * @return A normalized document (an array of T instances).
   */
  serialize<T>(query: object[], schema: Schema): T[] {
    const collection: T[] = [];

    // An object is used instead of a map because it's sufficiently faster, and
    // speed is important when normalizing a large query of tabular, relational
    // data.
    const lookup: LookupType = {};

    // Helper function to recursively serialize a row of query data.
    function serializeRow<R>(
      queryRow: QueryRowType,
      schema: Schema,
      lookup: LookupType,
      collection?: R[]): R {

      const keyCol = schema.getKeyColumn().name;
      const keyVal = queryRow[keyCol];
      let doc;

      // The keyCol is null, meaning this was an outer join and there is no
      // related data.
      if (!keyVal)
        return null;
        
      // First time encountering this key.  Create a document for it.
      if (lookup[keyVal] === undefined) {
        // The schema holds the table (see the Table decorator), and the table
        // stores the decorated Entity.  Produce one (i.e. new() on the Entity).
        doc = schema.table.produceEntity();

        // Add the new document to the collection if provided (the collection
        // is provided when this document is being mapped to an array (e.g.
        // the parent relates to this Entity with a one-to-many cardinality).
        if (collection)
          collection.push(doc);

        // Add each property->column value to the document.
        for (let i = 0; i < schema.columns.length; ++i) {
          const column  = schema.columns[i];
          const colMeta = column.meta;
          const colName = column.name;

          // If there's an onRetrieve converter then call it with the column
          // value.  Otherwise just map the column on to the document.  (mapTo
          // is the Column-decorated property name.)
          if (colMeta.converter && colMeta.converter.onRetrieve)
            doc[colMeta.mapTo] = colMeta.converter.onRetrieve(queryRow[colName]);
          else
            doc[colMeta.mapTo] = queryRow[colName];
        }

        // This lookup is used to ensure uniqueness.
        lookup[keyVal] = {
          document: doc,
          lookup:   {}
        };
      }
      else
        doc = lookup[keyVal].document;

      // Now recursivly serialize each sub schema.
      for (let i = 0; i < schema.schemata.length; ++i) {
        const relationship = schema.schemata[i].relationship;
        const relProp      = relationship.mapTo;
        const subSchema    = schema.schemata[i].schema;
        let subLookup, subCollection;

        // Note that the lookup for each document needs to be unique because
        // there could be two schemata at the same level that have key columns
        // with the same value (e.g. a person with product and phone numbers,
        // and phoneNumberID = 1 and productID = 1).
        if (lookup[keyVal].lookup[relProp] === undefined)
          lookup[keyVal].lookup[relProp] = {};
        subLookup = lookup[keyVal].lookup[relProp];

        // For OneToMany relationships the subdocument needs to be added to
        // a subcollection.
        if (relationship.cardinality === 'OneToMany') {
          if (doc[relProp] === undefined)
            doc[relProp] = [];
          subCollection = doc[relProp];

          serializeRow(queryRow, subSchema, subLookup, subCollection);
        }
        // Otherwise this is a ManyToOne or OneToOne relationship, so add
        // the document under the relationship's property.
        else {
          doc[relProp] = serializeRow(queryRow, subSchema, subLookup);
        }
      }

      return doc;
    }
    
    // Serialize each row recursively.
    for (let i = 0; i < query.length; ++i)
      serializeRow(query[i], schema, lookup, collection);

    return collection;
  }
}

