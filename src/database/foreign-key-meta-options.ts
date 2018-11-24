export class ForeignKeyMetaOptions {
  // The name of the column in this table that references the foreign table.
  column: string;

  // Function that returns the type of Table that this references (e.g.
  // the constructor of the associated Entity).
  getReferencedTable: () => {new(): any};
}

