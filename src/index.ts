import type * as types from '../types.d.ts';

declare global {
  interface JSON {
    isRawJSON(value: unknown): boolean;
    rawJSON(value: unknown): object;
  }
}

// as of writing, supported by Chrome and Node:
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/isRawJSON
const isRawJSON: (node: unknown) => boolean = JSON.isRawJSON
  ? (node: unknown) => JSON.isRawJSON(node)
  : () => false;

// used to maintain "this" in the user-passed replacer, maps from the newly updated/sorted version
// to the original that can be passed in properly
const updateMap = new WeakMap<any, any>();

function sortedReplacer(key: string, value: any) {
  // nb. use of `==`
  if (value == null || typeof value !== 'object' || Array.isArray(value) || isRawJSON(value)) {
    return value;
  }

  // Integer keys will always be grouped first (and sorted within the group) regardless of
  // insertion order. This doesn't match ".sort()", but it is consistent!
  const update: Record<string, any> = {};
  for (const key of Object.keys(value).sort()) {
    update[key] = value[key];
  }
  return update;
}

export const stringify: typeof types.stringify = (object, replacer, space) => {
  let r: types.Replacer = sortedReplacer;
  if (replacer) {
    r = function (key, value) {
      const userUpdate = replacer.call(updateMap.get(this), key, value);
      const libraryUpdate = sortedReplacer(key, userUpdate);

      // differs only if value is a dictionary
      if (libraryUpdate !== userUpdate) {
        updateMap.set(libraryUpdate, value);
      }

      return libraryUpdate;
    };
  }

  return JSON.stringify(object, r, space);
};

export { stringify as default };
