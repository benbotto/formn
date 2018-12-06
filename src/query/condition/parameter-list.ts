import { ParameterType } from './parameter-type';
import { ConditionError } from '../../error/condition-error';

/**
 * A class that holds query parameters.
 */
export class ParameterList {
  private paramID: number;

  /**
   * Key-value pairs.  Each key is a parameter in a query.
   */
  public params: ParameterType = {};

  /**
   * Initialize the list of parameters.
   * @param paramList - An optional list of parameters to copy.
   */
  constructor(paramList?: ParameterList) {
    if (paramList) {
      this.addParameters(paramList.params);
      this.paramID = paramList.getParamID();
    }
    else
      this.paramID = 0;
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
  addParameter(key: string, value: any, overwrite: boolean = false): ParameterList {
    if (!key.match(/^[A-Za-z][\w\-]*$/))
      throw new ConditionError('Parameter keys must match "/^[A-Za-z][\\w\\-]*$/".');

    if (this.params[key] !== undefined && this.params[key] !== value && !overwrite)
      throw new ConditionError(`Parameter "${key}" already exists with value "${this.params[key]}".`);

    this.params[key] = value;

    return this;
  }

  /**
   * Add parameters to the list.
   * @param params - An object containing key-value pairs.
   * @param overwrite - Whether or not to blindly overwrite existing
   * parameters.
   */
  addParameters(params: ParameterType, overwrite: boolean = false): ParameterList {
    for (let key in params)
      this.addParameter(key, params[key], overwrite);

    return this;
  }
}

