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
}

