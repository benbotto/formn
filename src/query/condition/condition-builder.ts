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
   * $lte, $gt, $gte, $like, or $notLike.
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
      '$in', '$notIn',
      '$is', '$isnt',
    ];

    assert(validOps.indexOf(op) !== -1, `Invalid condition operator "${op}."`);

    if (param !== undefined) {
      assert(propOrParamName[0] === ':',
        'Parameter names must start with a colon.');

      if (Array.isArray(param)) {
        const paramBaseName = propOrParamName.substr(1);

        param.forEach(param => paramList
          .addParameter(paramList
            .createParameterName(paramBaseName),
            param));
      }
      else
        paramList.addParameter(propOrParamName.substr(1), param);
    }

    return new ParameterizedCondition(
      {[op]: {[prop]: propOrParamName}},
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
   * In comparison.  See [[ConditionBuilder.comp]].
   */
  in(prop: string, propOrParamName: string, param?: any[]): ParameterizedCondition {
    return this.comp('$in', prop, propOrParamName, param);
  }

  /**
   * Not in comparison.  See [[ConditionBuilder.comp]].
   */
  notIn(prop: string, propOrParamName: string, param?: any[]): ParameterizedCondition {
    return this.comp('$notIn', prop, propOrParamName, param);
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

