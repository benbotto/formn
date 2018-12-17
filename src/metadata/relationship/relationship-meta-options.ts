import { CardinalityType } from './cardinality-type';
import { PropertyMapType } from '../property/property-map-type';

/**
 * Options for the [[Relationship]] decorator.  Reads "ENT_T is related to
 * REF_ENT_T."
 */
export class RelationshipMetaOptions<ENT_T, REF_ENT_T> {
  /**
   * Function that returns the type of Table that this references (e.g.
   * the constructor of the associated [[Table]]-decorated class).
   */
  to: () => {new(): REF_ENT_T};

  /**
   * How ENT_T and REF_ENT_T are related.  This is a function that, given ENT_T
   * and REF_ENT_T [[PropertyMapType]]s, returns an array of
   * [[Column]]-decorated property names that will be used to join the two
   * tables.  For example, joining Users (u) and PhoneNumbers (pn): (u, pn) =>
   * [u.id, pn.userID].  If the relationship is composite, then an array of
   * arrays should be returned.
   */
  on: ((ent: ENT_T|PropertyMapType, refEnt: REF_ENT_T|PropertyMapType) => string[]|string[][]|any[]);

  /**
   * Cardinality of the relationship (e.g. OneToOne, ManyToOne, etc.).
   */
  cardinality: CardinalityType;
}

