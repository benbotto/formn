import { plural } from 'pluralize';
import { camelCase } from 'change-case';

import { RelationshipFormatter, ModelRelationship } from '../';

/**
 * Default formatter for relationships.
 */
export class DefaultRelationshipFormatter implements RelationshipFormatter {
  /**
   * Given a [[ModelRelationship]] instance, return the formatted property
   * name.  For non-composite, many-to-one relationships the local column's
   * property name is used, and "ID" shall be stripped off, if present.
   * Otherwise the foreign table's class name is used: it's converted to camel
   * case and made plural if the cardinality is OneToMany.
   */
  formatPropertyName(relationship: ModelRelationship): string {
    const columns     = relationship.getColumns();
    const cardinality = relationship.getCardinality();
    let propName;

    if (columns.length === 1 && cardinality === 'ManyToOne') {
      propName = columns[0][0]
        .getPropertyName()
        .replace(/ID$/i, '');
    }
    else {
      propName = relationship.getReferencedTable()
        .getClassName();
    }

    if (cardinality === 'OneToMany')
      propName = plural(propName);

    return camelCase(propName);
  }
}

