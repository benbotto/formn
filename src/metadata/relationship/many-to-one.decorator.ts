import { Relationship } from './relationship.decorator';

/**
 * Wrapper for [[Relationship]] with a hard-coded cardinality.
 */
export function ManyToOne<ENT_T, REF_ENT_T>(
  to: () => {new(): REF_ENT_T},
  on: ((ent: ENT_T, refEnt: REF_ENT_T) => string[]|any[])) {

  return Relationship({to, on, cardinality: 'ManyToOne'});
}
