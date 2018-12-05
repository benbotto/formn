import { Escaper } from '../escaper/escaper';
import { ParseTree } from './parse-tree';
import { ParameterType } from './parameter-type';
import { LexerToken } from './lexer-token';
import { ConditionError } from '../../error/condition-error';

/**
 * A class that compiles a [[ParseTree]], as created by a [[ConditionParser]]
 * instance, into a SQL condition.
 */
export class ConditionCompiler {
  /**
   * Initialize the compiler.
   * @param escaper - An instance of an [[Escaper]] that matches the database
   * type (e.g. [[MySQLEscaper]] or [[MSSQLEscaper]]).  This is used for
   * escaping column names.
   */
  constructor(private escaper: Escaper) {
  }

  /**
   * Compile the parse tree.
   * @param parseTree - A [[ParseTree]] object, as created by the
   * [[ConditionParser.parse]] method.
   * @param params - An object containing key-value pairs that are
   * used to replace parameters in the query.  The compiler verifies that
   * there is a replacement for every parameter, but does not perform the
   * actual replacement.
   * @return The compiled condition as a SQL string.
   */
  compile(parseTree: ParseTree, params: ParameterType = {}): string {
    const compOps: ParameterType = {
      $eq:      '=',
      $neq:     '<>',
      $lt:      '<',
      $lte:     '<=',
      $gt:      '>',
      $gte:     '>=',
      $like:    'LIKE',
      $notLike: 'NOT LIKE'
    };

    const nullOps: ParameterType = {
      $is:   'IS',
      $isnt: 'IS NOT'
    };

    const boolOps: ParameterType = {
      $and: 'AND',
      $or:  'OR'
    };

    const inOps: ParameterType = {
      $in   : 'IN',
      $notIn: 'NOT IN'
    };

    return traverse(parseTree, this.escaper, params);

    // Function to recursively traverse the parse tree and compile it.
    function traverse(tree: ParseTree, escaper: Escaper, params: ParameterType): string {
      // Helper to return a <value>, which may be a parameter, column, or number.
      // The return is escaped properly.
      function getValue(token: LexerToken, escaper: Escaper): string|number {
        // The token could be a column, a parameter, or a number.
        if (token.type === 'column')
          return escaper.escapeFullyQualifiedColumn(token.value as string);
        else if (token.type === 'parameter') {
          // Find the value in the params list (the leading colon is removed).
          const paramKey = (token.value as string).substring(1);
          const value    = params[paramKey];

          if (value === undefined)
            throw new ConditionError(`Replacement value for parameter "${paramKey}" not present.`);
        }

        return token.value;
      }

      switch (tree.token.type) {
        case 'comparison-operator': {
          // <column> <comparison-operator> <value> (ex. `users`.`name` = :name)
          // where value is a parameter, column, or number.
          const column: string = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value as string);
          const op = compOps[tree.token.value];
          const value  = getValue(tree.children[1].token, escaper);

          return `${column} ${op} ${value}`;
        }

        case 'null-comparison-operator': {
          // <column> <null-operator> <nullable> (ex. `j`.`occupation` IS NULL).
          // Note that if a parameter is used (e.g. {occupation: null}) it's
          // ignored.  NULL is blindly inserted since it's the only valid value.
          const column = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value as string);
          const op     = nullOps[tree.token.value];

          return `${column} ${op} NULL`;
        }

        case 'in-comparison-operator': {
          // <column> <in-comparison-operator> (<value> {, <value}) (ex. `shoeSize` IN (10, 10.5, 11)).
          const column = escaper.escapeFullyQualifiedColumn(tree.children[0].token.value as string);
          const op     = inOps[tree.token.value];
          const kids   = tree.children
            .slice(1)
            .map(kid => getValue(kid.token, escaper))
            .join(', ');

          return `${column} ${op} (${kids})`;
        }

        case 'boolean-operator': {
          // Each of the children is a <condition>.  Put each <condition> in an array.
          const kids = tree.children
            .map(kid => traverse(kid, escaper, params))
            .join(` ${boolOps[tree.token.value]} `);

          // Explode the conditions on the current boolean operator (AND or OR).
          // Boolean conditions must be wrapped in parens for precedence purposes.
          return `(${kids})`;
        }

        default: {
          // The only way this can fire is if the input parse tree did not come
          // from the ConditionParser.  Trees from the ConditionParser are
          // guaranteed to be syntactically correct.
          throw new ConditionError(`Unknown type: ${tree.token.type}.`);
        }
      }
    }
  }

  /**
   * Get all the columns referenced in the [[ParseTree]] and return them as an
   * array.  The columns will be distinct (that is, if the same column appears
   * multiple times in the same condition, it will exist in the returned array
   * only once).
   * @param parseTree - The [[ParseTree]], as created by a [[ConditionParser]].
   */
  getColumns(parseTree: ParseTree): string[] {
    const columns: string[] = [];

    // Recursively traverse tree.
    (function traverse(tree: ParseTree, columns: string[]): void {
      // If the current node is a column and not yet in the list of columns, add it.
      if (tree.token.type === 'column' && columns.indexOf(tree.token.value as string) === -1)
        columns.push(tree.token.value as string);

      // Recurse into all children.
      for (let i = 0; i < tree.children.length; ++i)
        traverse(tree.children[i], columns);
    })(parseTree, columns);

    return columns;
  }
}

