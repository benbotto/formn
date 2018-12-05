/**
 * A token that's generated from the [[ConditionLexer]].  It has a type, a
 * terminal flag, and a value, and is intended for use with the
 * [[ConditionParser]].
 */
export class LexerToken {
  /**
   * Initialize the token.
   * @param terminal - Whether or not the token is terminal.
   * @param type - The token type, as a string (e.g. boolean-operator).
   * @param value - The value of the token.
   */
  constructor(
    public terminal: boolean,
    public type: string,
    public value: any) {
  }
}
