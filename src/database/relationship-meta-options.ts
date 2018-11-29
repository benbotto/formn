import { CardinalityType } from './cardinality-type';

export class RelationshipMetaOptions<ENT_T, REF_ENT_T> {
  // Function that returns the type of Table that this references (e.g.
  // the constructor of the associated Table-decorated class).  Reads
  // "ENT_T is related to REF_ENT_T."
  to: () => {new(): REF_ENT_T};

  // How ENT_T and REF_ENT_T are related.  This is a function that, given ENT_T
  // and REF_ENT_T property maps returns an array of Column-decorated
  // properties that will be used to join the two tables.
  on: ((ent: ENT_T, refEnt: REF_ENT_T) => string[]|any[]);

  // Cardinality of the relationship (e.g. OneToOne, ManyToOne, etc.).
  cardinality: CardinalityType;
}

