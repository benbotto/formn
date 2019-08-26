import { ParameterList, ParameterType } from '../';

/**
 * A type that holds a condition object and any associated parameters.
 */
export class ParameterizedCondition {
  /**
   * Initialize the condition.
   * @param cond - A condition object that can be lexed, parsed, and compiled.
   * @param paramList - Any parameters referenced in the condition object.
   */
  constructor(
    private cond: object,
    private paramList: ParameterList) {
  }

  /**
   * Get the condition object.
   */
  getCond(): object {
    return this.cond;
  }

  /**
   * Get the parameters.
   */
  getParams(): ParameterType {
    return this.paramList.getParams();
  }

  /**
   * Get the [[ParameterList]].
   */
  getParameterList(): ParameterList {
    return this.paramList;
  }

  /**
   * Convert cond and param objects into a ParameterizedCondition.
   * @param cond An condition object that can be transpiled into a SQL where
   * clause.
   * @param parms Parameter replacements for the condition.
   */
  static normalize(cond?: object, params?: ParameterType): ParameterizedCondition;

  /**
   * Do-nothing, identity normailization.  (This method just returns cond.)
   * @param cond A ParameterizedCondition object built with a ConditionBuilder.
   */
  static normalize(cond: ParameterizedCondition): ParameterizedCondition;

  /**
   * Given cond and params object or a ParameterizedCondition, normalize to a
   * ParameterizedCondition.
   */
  static normalize(cond: object | ParameterizedCondition, params?: ParameterType): ParameterizedCondition {
    if (cond instanceof ParameterizedCondition)
      return cond;

    const paramList = new ParameterList();

    for (const key in params)
      paramList.addParameter(key, params[key]);

    return new ParameterizedCondition(cond, paramList);
  }
}

