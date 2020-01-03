import { assert, ConditionError } from '../../error/';

import { ParameterType } from '../';

/**
 * A class that holds query parameters.
 */
export class ParameterList {
  private paramID: number;

  // Key-value pairs.  Each key is a parameter in a query.
  private params: Map<string, any> = new Map();

  /**
   * Initialize the list of parameters.
   * @param paramList - An optional list of parameters to copy.
   */
  constructor(paramList?: ParameterList) {
    if (paramList) {
      this.addParameters(paramList.getParams());
      this.paramID = paramList.getParamID();
    }
    else
      this.paramID = 0;
  }

  /**
   * Get all the parameters as key-value pairs.
   */
  getParams(): ParameterType {
    const paramObj: ParameterType = {};

    for (let [key, val] of this.params)
      paramObj[key] = val;

    return paramObj;
  }

  /**
   * Get a single param or throw.
   */
  getParam(key: string): any {
    assert(this.params.has(key), `Parameter "${key}" not found.`);

    return this.params.get(key);
  }

  /**
   * Get all the parameter names.
   */
  getParamNames(): string[] {
    return Array.from(this.params.keys());
  }

  /**
   * Get the parameterID, which is used for auto-generated parameters.
   */
  getParamID(): number {
    return this.paramID;
  }

  /**
   * Create a parameter name by replacing all non-word characters with
   * underscores and adding a unique ID at the end.
   * @param key - The parameter key.
   * @return The unique parameter name.
   */
  createParameterName(key: string): string {
    return `${key.replace(/[^\w]/g, '_')}_${this.paramID++}`;
  }

  /**
   * Add a parameter to the list.
   * @param key - The name of the parameter.
   * @param value - The parameter value.
   * @param overwrite - By default, an exception will be raised if a parameter
   * matching key already exists and the value is different.  If this flag is
   * set to true, however, then parameters will be blindly overwritten.
   */
  addParameter(key: string, value: any, overwrite: boolean = false): this {
    if (!key.match(/^[A-Za-z][\w]*$/))
      throw new ConditionError('Parameter keys must match "/^[A-Za-z][\\w]*$/".');

    if (this.params.has(key) && this.params.get(key) !== value && !overwrite)
      throw new ConditionError(`Parameter "${key}" already exists with value "${this.params.get(key)}".`);

    this.params.set(key, value);

    return this;
  }

  /**
   * Add parameters to the list.
   * @param params - An object containing key-value pairs.
   * @param overwrite - Whether or not to blindly overwrite existing
   * parameters.
   */
  addParameters(params: ParameterType, overwrite: boolean = false): this {
    for (let key in params)
      this.addParameter(key, params[key], overwrite);

    return this;
  }
}

