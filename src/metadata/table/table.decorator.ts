import { TableMetaOptions, TableMetadata, TableType, metaFactory } from '../';

/**
 * Decorator that is applied to a class to make it ORM capable.  That is, it
 * registers the class with formn so that it can be mapped to and from a
 * database table.  The decorator registers the class's [[TableMetadata]] in
 * the [[TableStore]].
 */
export function Table(options: TableMetaOptions = new TableMetaOptions()) {
  return function(ctor: TableType) {
    if (!options.name)
      options.name = ctor.name;

    const tableStore = metaFactory
      .getTableStore();

    metaFactory
      .getTableStore()
      .addTableMetadata(new TableMetadata(ctor, options.name, options.schema));

    // If this table is an extension of another, then all the metadata (Column,
    // Relationship, and PropertyMap) from the parent gets propagated to the
    // child.
    const parentCtor = Object.getPrototypeOf(ctor.prototype).constructor;
    const colStore   = metaFactory.getColumnStore();

    if (colStore.hasColumnMetadata(parentCtor)) {
      const pColMetas = colStore.getColumnMetadata(parentCtor);

      // Clone each ColumnMetadata for the parent table and swap out the
      // Entity.
      for (const pColMeta of pColMetas) {
        const cColMeta = pColMeta.clone();

        cColMeta.Entity = ctor;

        colStore.addColumnMetadata(cColMeta);
      }

      // Copy the property map down to the child.
      const propStore = metaFactory.getPropertyMapStore();
      const propMap   = propStore.getPropertyMap(parentCtor);

      for (const prop in propMap)
        propStore.addProperty(ctor, prop);

      // Copy over any relationships.  Note that only relationships on the
      // parent are copied over.  E.g. if User has PhoneNumber[] and
      // ExtendedUser extends User, the relationship from User to PhoneNumber
      // is copied from User to ExtendedUser, but the relationship from
      // PhoneNumber back to User is not copied.  1) Circular dependencies
      // require runtime resolution, and 2) when mapping, the type of related
      // instances would be incorrect (the parent class).
      const relStore  = metaFactory.getRelationshipStore();
      // Relationships from the parent to any table (one-way).
      const pRelations = relStore.getRelationships(parentCtor, null, true);

      for (const pRelation of pRelations) {
        const cRelation = pRelation.clone();

        cRelation.Entity = ctor;

        relStore.addRelationshipMetadata(cRelation);
      }
    }
  }
}

