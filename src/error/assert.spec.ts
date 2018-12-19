import { assert } from './';

describe('assert()', () => {
  it('allows booleans to be used directly.', () => {
    expect(() => {
      assert(false, 'Error!');
    }).toThrowError('Error!');

    expect(() => {
      assert(true, 'Error!');
    }).not.toThrow();
  });

  it('can use truthy values.', () => {
    expect(() => {
      assert('test', 'Error!');
    }).not.toThrow();

    expect(() => {
      assert(1, 'Error!');
    }).not.toThrow();

    expect(() => {
      assert(1 === 1, 'Error!');
    }).not.toThrow();
  });

  it('throws on falsy values.', () => {
    expect(() => {
      assert(0, 'Error!');
    }).toThrowError('Error!');

    expect(() => {
      assert(undefined, 'Error!');
    }).toThrowError('Error!');

    expect(() => {
      assert(null, 'Error!');
    }).toThrowError('Error!');

    expect(() => {
      assert(false, 'Error!');
    }).toThrowError('Error!');
  });
});

