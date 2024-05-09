import util from 'util';

export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };

/**
 * converts a map into an array of key value pairs
 * the first element of the pair is the key, the second is the value 
 */
function mapSerializer(map: any): any[][] {
  const result = [];
  for (const [key, value] of map) {
    result.push([key, value]);
  }
  return result;
}

function mapDeserializer(data: any[][]): Map<any, any> {
  const result = new Map();
  for (const [key, value] of data) {
    result.set(key, value);
  }
  return result;
}

function setSerializer(set: any): any[] {
  const result = [];
  for (const value of set) {
    result.push(value);
  }
  return result;
}
function setDeserializer(value: any[]): Set<any> {
  const result = new Set();
  for (const item of value) {
    result.add(item);
  }
  return result;
}

function bufferSerializer(buffer: any): number[] {
  const result = [];
  for (const byte of buffer) {
    result.push(byte);
  }
  return result;
}

function bufferDeserializer(data: number[]): Buffer {
  return Buffer.from(data);
}

function dateSerializer(date: any): number {
  return date.getTime();
}

function dateDeserializer(data: number): Date {
  return new Date(data);
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
  const serializerStrategies = {
    'Map': mapSerializer,
    'Set': setSerializer,
    'Buffer': bufferSerializer,
    'Date': dateSerializer,
  }
  // special case: Objects
  // with objects, we iterate through the keys of the object and call serialize on each value
  if (type === 'Object') {
    const keys = Object.keys(value);
    storedValue = {};
    for (const key of keys) {
      storedValue[key] = serialize(value[key]);
    }
    return storedValue;
  } else if (type === 'Array') {
    const storedValues = [];
    for (const item of value as Value[]) {
      storedValues.push(serialize(item));
    }
    return storedValues;
  }
  const serializer = serializerStrategies[type] || ((value: any) => value);
  storedValue = serializer(value);

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
  const deserializerStrategies = {
    'Map': mapDeserializer,
    'Set': setDeserializer,
    'Buffer': bufferDeserializer,
    'Date': dateDeserializer
  }
  const { __t: type, __v: storedValue } = value as { __t: string, __v: any };
  // special cases: Objects and arrays
  // they are special if type is undefined and storedValue is undefined
  if (type === undefined && storedValue === undefined) {
    // we're probably dealing with an object or array
    const storedValueType = value.constructor.name;
    if (storedValueType === 'Object') {
      const result = {};
      for (const key of Object.keys(value)) {
        result[key] = deserialize(value[key]);
      }
      return result as T;
    } else if (storedValueType === 'Array') {
      const result = [];
      for (const item of value as Value[]) {
        result.push(deserialize(item));
      }
      return result as T;
    }
  }
  const deserializer = deserializerStrategies[type] || ((value: any) => value);
  return deserializer(storedValue);
}
