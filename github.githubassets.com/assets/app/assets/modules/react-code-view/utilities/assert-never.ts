/**
 * Helper function for exhaustive checks of discriminated unions.
 *
 * @example
 * ```
 *    type A = {type: 'a'};
 *    type B = {type: 'b'};
 *    type Union = A | B;
 *
 *    function doSomething(arg: Union) {
 *      if (arg.type === 'a') {
 *        return something;
 *      }
 *
 *      if (arg.type === 'b') {
 *        return somethingElse;
 *      }
 *
 *      // TS will error if there are other types in the union
 *      // Will throw an Error when called at runtime.
 *      return assertNever(arg);
 *    }
 * ```
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`)
}
