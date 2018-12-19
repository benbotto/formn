import { OrderDirectionType } from '../';

/**
 * Object describing how to order a select query.
 */
export type OrderByType = {
  /**
   * Fully-qualified property name (e.g. &lt;table-alias&gt;.&lt;property&gt;);
   */
  property: string;

  /**
   * Direction (ASC or DESC).
   */
  dir: OrderDirectionType;
}

