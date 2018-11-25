/**
 * Function that throws an Error(message) if condition is falsy.
 * @param condition - The condition, which is checked if falsy (!condition).
 * @param message - The message wich is thrown in an Error if * condition is
 * falsy.
 */
export function assert(condition:any, message: string): void {
	if (!condition)
		throw new Error(message);
}

