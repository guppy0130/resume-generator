import type { GenericFilterableNamedObject } from '../../lib';

const first = (
  content: Array<GenericFilterableNamedObject>,
  count: number = 1
): Array<GenericFilterableNamedObject> => {
  return content.slice(0, count);
};

const random = (
  content: Array<GenericFilterableNamedObject>,
  count: number = 1
): Array<GenericFilterableNamedObject> => {
  const result = new Array(count);
  let len = content.length;
  const taken = new Array(len);
  if (count > len) {
    throw new RangeError('getRandom: more elements taken than available');
  }
  while (count--) {
    const x = Math.floor(Math.random() * len);
    result[count] = content[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
};

export { first, random };
