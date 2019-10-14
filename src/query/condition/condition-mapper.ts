import {
  ConditionLexer, ConditionParser, ParseTree, LexerToken, ParameterType
} from '../';

import { ColumnLookup } from '../../metadata';

import { ConditionError } from '../../error/';

/**
 * High-level helper class that is used to change the names of properties in a
 * condition using a ColumnLookup instance.
 */
export class ConditionMapper {
  /**
   * Map the condition.
   * @param condStr - The condition string to parse.  If condStr is an object
   * it is converted to a string using JSON.stringify.
   * @param columnLookup - A [[ColumnLookup]] instance used to change the
   * properties (loosly "columns") in the condition.
   * @param params - An optional object containing key-value pairs that are
   * used to replace parameters in the query.  The compiler verifies that there
   * is a replacement for every parameter, but does not perform the actual
   * replacement.
   * @return The same condition, but with the column/property names changed.
   */
  map(condStr: string | object, columnLookup: ColumnLookup, params?: ParameterType): object {
    const tokens = new ConditionLexer()
      .parse(condStr);
    const parseTree = new ConditionParser()
      .parse(tokens);

    const cond = recompile(parseTree, columnLookup, params);

    return cond;

    // Recursively traverse the parse tree, changing any column names using the
    // ColumnLookup, and rebuild the condition object.
    function recompile(tree: ParseTree, columnLookup: ColumnLookup, params?: ParameterType): object {
      switch (tree.token.type) {
        case 'comparison-operator':
        case 'null-comparison-operator': {
          //   $eq
          //  /   \
          // col  val
          const op     = tree.token.value;
          const column = columnLookup.getColumn(tree.children[0].token.value as string);
          const value  = getValue(tree.children[1].token, params);

          return {[op]: {[column]: value}};
        }

        case 'in-comparison-operator': {
          //   ___$in___
          //  /    |    \
          // col  val0  valN
          const op     = tree.token.value;
          const column = columnLookup.getColumn(tree.children[0].token.value as string);
          const kids   = tree.children
            .slice(1)
            .map(kid => getValue(kid.token, params));

          return {[op]: {[column]: kids}};
        }

        case 'boolean-operator': {
          //   ___$and___
          //  /    |     \
          // cond0  cond1 condN
          const op   = tree.token.value;
          const kids = tree.children
            .map(kid => recompile(kid, columnLookup, params));

          return {[op]: kids};
        }

        default: {
          // The only way this can fire is if the input parse tree did not come
          // from the ConditionParser.  Trees from the ConditionParser are
          // guaranteed to be syntactically correct.
          throw new ConditionError(`Unknown type: ${tree.token.type}.`);
        }
      }

      // Returns the value of token with a verification that it exists in params.
      function getValue(token: LexerToken, params: ParameterType): string|number {
        if (params && token.type === 'parameter') {
          // Find the value in the params list (the leading colon is removed).
          const paramKey = (token.value as string).substring(1);
          const value    = params[paramKey];

          if (value === undefined)
            throw new ConditionError(`Replacement value for parameter "${paramKey}" not present.`);
        }

        return token.value;
      }
    }
  }
}
