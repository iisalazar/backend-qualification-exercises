export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };

/**
 * converts a map into an array of key value pairs
 * the first element of the pair is the key, the second is the value 
 */
function serializeMap(map: any): any[][] {
  const result = [];
  for (const [key, value] of map) {
    result.push([key, value]);
  }
  return result;
}

/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 */
export function serialize(value: Value): unknown {
  /**
   * insert your code here
   */

  // case 1: scalar values
  // scalar values are straight-forward - we return them as is
  // exceptions are nulls and undefineds
  if (typeof value !== 'object' || value === null || value === undefined) {
    return value;
  }

  // for objects, we need to convert them into an object
  // shape is { __t: 'Map' | 'Set' | 'Buffer' | 'Date' | 'Array' | 'Object', __v: any}
  const type = value.constructor.name;
  let storedValue: any = null;
  switch (type) {
    case 'Map': 
      storedValue = serializeMap(value);
      break;
    default:
      storedValue = value;
  }
  
  return {
    __t: value.constructor.name,
    __v: storedValue,
  }
}

/**
 * Transforms JSON compatible scalars and objects into JavaScript
 * scalar and objects.
 */
export function deserialize<T = unknown>(value: unknown): T {
  /**
   * insert your code here
   */
  
  // case 1: scalar values
  // scalar values are straight-forward - we return them as is
  // exceptions are nulls and undefineds
  if (typeof value !== 'object' || value === null || value === undefined) {
    return value as T;
  }
  return;
}
