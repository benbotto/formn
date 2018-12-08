import { OrderDirectionType } from './order-direction-type';

/**
 * Object describing how to order a select query.
 */
export type OrderByType = {
  /**
   * Fully-qualified property name (e.g. &lt;table-alias&gt;.&lt;property&gt;);
   */
  fqProperty: string;

  /**
   * Direction (ASC or DESC).
   */
  dir: OrderDirectionType;
}

