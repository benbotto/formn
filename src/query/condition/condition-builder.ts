import { assert } from '../../error/';

import { ParameterizedCondition, ParameterList, ParameterType } from '../';

/**
 * Used for building conditions.  The conditions can be used with WHERE and ON
 * clauses.
 */
export class ConditionBuilder {
  /**
   * A comparison operation.
   * @param op - The comparison operator, as a string: $eq, $neq, $lt,
   * $lte, $gt, $gte, $like, $notLike, $is, $isnt.
   * @param prop - The name of a fully-qualified property in a query in the form
   * &lt;table-alias&gt;.&lt;property&gt;.
   * @param propOrParamName - Either a fully-qualified property, or a parameter name
   * preceded by a colon (e.g. :someParameter).
   * @param param - A replacement value if propOrParamName is a parameter name.
   */
  comp(
    op: string,
    prop: string,
    propOrParamName: string,
    param?: any): ParameterizedCondition {

    const paramList = new ParameterList();
    const validOps  = [
      '$eq', '$neq', '$lt', '$lte', '$gt', '$gte', '$like', '$notLike',
      '$is', '$isnt',
    ];

    assert(validOps.indexOf(op) !== -1, `Invalid condition operator "${op}."`);

    if (param !== undefined) {
      assert(propOrParamName[0] === ':',
        'Parameter names must start with a colon.');

      paramList.addParameter(propOrParamName.substr(1), param);
    }

    return new ParameterizedCondition(
      {[op]: {[prop]: propOrParamName}},
      paramList);
  }

  /**
   * A IN (IN or NOT IN) comparison operation.
   * @param op - The comparison operator, as a string: $in, $notIn.
   * @param prop - The name of a fully-qualified property in a query in the form
   * &lt;table-alias&gt;.&lt;property&gt;.
   * @param propsOrParamBaseName - Either a fully-qualified property, or a
   * parameter name preceded by a colon (e.g. :someParameter).  If a parameter
   * name is provided, it's used a base name.  Each property is parameterized,
   * and the parameter names are suffixed with _# (e.g. :param_0, :param_1,
   * ..., :param_n).
   * @param params - An array of replacement values if propOrParamName is a
   * parameter name.
   */
  inComp(
    op: string,
    prop: string,
    propsOrParamBaseName: string | string[],
    params?: any[]): ParameterizedCondition {

    const paramList = new ParameterList();
    const validOps  = ['$in', '$notIn'];

    assert(validOps.indexOf(op) !== -1, `Invalid condition operator "${op}."`);

    if (params !== undefined) {
      assert(typeof propsOrParamBaseName === 'string',
        'Parameter base name must be a string.');

      assert(propsOrParamBaseName[0] === ':',
        'Parameter names must start with a colon.');

      const paramBaseName = (propsOrParamBaseName as string).substr(1);

      params.forEach(param => paramList
        .addParameter(paramList
          .createParameterName(paramBaseName),
          param));

      const paramNames = paramList
        .getParamNames()
        .map(p => `:${p}`);

      return new ParameterizedCondition(
        {[op]: {[prop]: paramNames}},
        paramList);
    }
    else {
      assert(Array.isArray(propsOrParamBaseName),
        'IN condition properties must be an array.');
    }

    return new ParameterizedCondition(
      {[op]: {[prop]: propsOrParamBaseName}},
      paramList);
  }

  /**
   * Aggregate comparison (and or or).
   * @param op - The comparison operator, as a string: $and or $or.
   * @param conds - One or more [[ParameterizedCondition]] instances.
   */
  aggregateComp(
    op: string,
    ...conds: ParameterizedCondition[]): ParameterizedCondition {

    const validOps = ['$and', '$or'];

    assert(validOps.indexOf(op) !== -1, `Invalid condition operator "${op}."`);

    const paramList = new ParameterList();
    const cond: ParameterType = {
      [op]: [
      ]
    };

    for (let i = 0; i < conds.length; ++i) {
      cond[op].push(conds[i].getCond());
      paramList.addParameters(conds[i].getParams());
    }

    return new ParameterizedCondition(cond, paramList);
  }

  /**
   * Equal comparison.  See [[ConditionBuilder.comp]].
   */
  eq(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$eq', prop, propOrParamName, param);
  }

  /**
   * Not equal comparison.  See [[ConditionBuilder.comp]].
   */
  neq(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$neq', prop, propOrParamName, param);
  }

  /**
   * Less than comparison.  See [[ConditionBuilder.comp]].
   */
  lt(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$lt', prop, propOrParamName, param);
  }

  /**
   * Less than or equal comparison.  See [[ConditionBuilder.comp]].
   */
  lte(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$lte', prop, propOrParamName, param);
  }

  /**
   * Greater than comparison.  See [[ConditionBuilder.comp]].
   */
  gt(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$gt', prop, propOrParamName, param);
  }

  /**
   * Greater than or equal comparison.  See [[ConditionBuilder.comp]].
   */
  gte(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$gte', prop, propOrParamName, param);
  }

  /**
   * Like comparison.  See [[ConditionBuilder.comp]].
   */
  like(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$like', prop, propOrParamName, param);
  }

  /**
   * Not like comparison.  See [[ConditionBuilder.comp]].
   */
  notLike(prop: string, propOrParamName: string, param?: any): ParameterizedCondition {
    return this.comp('$notLike', prop, propOrParamName, param);
  }

  /**
   * In comparison.  See [[ConditionBuilder.inComp]].
   */
  in(prop: string, propsOrParamBaseName: string | string[], param?: any[]): ParameterizedCondition {
    return this.inComp('$in', prop, propsOrParamBaseName, param);
  }

  /**
   * Not in comparison.  See [[ConditionBuilder.inComp]].
   */
  notIn(prop: string, propsOrParamBaseName: string | string[], param?: any[]): ParameterizedCondition {
    return this.inComp('$notIn', prop, propsOrParamBaseName, param);
  }

  /**
   * Is null comparison.  See [[ConditionBuilder.comp]].
   */
  isNull(prop: string): ParameterizedCondition {
    return this.comp('$is', prop, null);
  }

  /**
   * Is not null comparison.  See [[ConditionBuilder.comp]].
   */
  isNotNull(prop: string): ParameterizedCondition {
    return this.comp('$isnt', prop, null);
  }

  /**
   * AND aggregate condition.  AND multiple conditions together.  See
   * [[ConditionBuilder.aggregateComp]].
   */
  and(...conds: ParameterizedCondition[]): ParameterizedCondition {
    return this.aggregateComp('$and', ...conds);
  }

  /**
   * OR aggregate condition.  OR multiple conditions together.  See
   * [[ConditionBuilder.aggregateComp]].
   */
  or(...conds: ParameterizedCondition[]): ParameterizedCondition {
    return this.aggregateComp('$or', ...conds);
  }
}

