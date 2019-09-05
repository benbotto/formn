/**
 * Custom Error instance for Condition (lex/parse/compile) errors.
 */
export class ConditionError extends Error {
  public name: string;
  public detail: string;

  /**
   * Create the Error instance with a user-supplied message.
   * @param {string} message - The Description of the error.
   */
  constructor(message: string) {
    super(message);

    // Design limitation in TypeScript when extending built-in types.
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#generated-constructor-code-substitutes-the-return-value-of-super-calls-as-this
    (<any>Object).setPrototypeOf(this, new.target.prototype);

    this.name   = 'ConditionError';
    this.detail = message;
  }
}
