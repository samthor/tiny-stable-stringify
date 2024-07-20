import type * as types from '../types.d.ts';

interface JSONRaw {
  rawJSON: string;
}

declare global {
  interface JSON {
    rawJSON(value: string): string;
    isRawJSON(value: unknown): value is JSONRaw;
  }
}

const toRawJSON: (node: unknown) => string | undefined = JSON.isRawJSON
  ? (node: unknown) => (JSON.isRawJSON(node) ? node.rawJSON : undefined)
  : () => undefined;

/*
reminder

- object keys sort by addition UNLESS they're numeric, in which case strict numeric ordering
- array sort always sorts lexicographically (e.g., "100" comes before "99")

two modes?

1. "always sort" (pass comparator)
2. "never sort" - fast mode that uses JSON.stringify - creates parallel object tree and reinserts non-numeric keys
*/

function prepareSpace(arg: number | string | undefined) {
  if (!arg) {
    return '';
  } else if (typeof arg === 'string') {
    return arg;
  }

  let out = '';
  for (let i = 0; i < arg; ++i) {
    out += ' ';
  }
  return out;
}

const defaultSortedKeysOfNode = (node: Record<string, any>) => Object.keys(node).sort();

function buildSortedKeysOfNode(
  compare?: types.Options['cmp'],
): (node: Record<string, any>) => string[] {
  if (compare === undefined) {
    return defaultSortedKeysOfNode;
  }

  return (node: Record<string, any>) => {
    return Object.keys(node).sort((a, b) => {
      return compare(
        { key: a, value: node[a] },
        { key: b, value: node[b] },
        {
          get(key) {
            return node[key];
          },
        },
      );
    });
  };
}

export const stringify: typeof types.stringify = (object, options) => {
  const replacer = options?.replacer ?? ((key, value) => value);
  const sortedKeysOfNode = buildSortedKeysOfNode(options?.cmp);
  const space = prepareSpace(options?.space);

  const keyValueSep = space ? ': ' : ':';
  const basePrefix = space ? '\n' : '';
  const seen: any[] = [];

  const internalStringify = (
    prefix: string,
    parent: Record<string, any>,
    key: string,
    node: any,
  ): string | undefined => {
    // coerce to JSON if helper method defined
    if (typeof node === 'object' && node?.toJSON && typeof node.toJSON === 'function') {
      node = node.toJSON(key);
    }

    // as of writing, supported by Chrome and Node:
    //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/isRawJSON
    const raw = toRawJSON(node);
    if (raw !== undefined) {
      return raw;
    }

    node = replacer.call(parent, key, node);

    if (node === null) {
      return 'null';
    } else if (typeof node !== 'object') {
      return JSON.stringify(node);
    }

    if (seen.indexOf(node) !== -1) {
      // stringify the whole thing, which should fail! ... safely throw anyway
      JSON.stringify(object);
      throw new TypeError(`Converting circular structure to JSON`);
    }
    seen.push(node);

    const nestedPrefix = prefix + space;

    if (Array.isArray(node)) {
      const vstrs = node.map((value, index) => {
        return (
          nestedPrefix + (internalStringify(nestedPrefix, node, String(index), value) ?? 'null')
        );
      });
      seen.pop();
      return `[${vstrs.join()}${prefix}]`;
    }

    const keys = sortedKeysOfNode(node);

    const vstrs: string[] = [];
    keys.map((key) => {
      const vstr = internalStringify(nestedPrefix, node, key, node[key]);
      if (vstr !== undefined) {
        const pair = nestedPrefix + JSON.stringify(key) + keyValueSep + vstr;
        vstrs.push(pair);
      }
    });

    seen.pop();
    return `{${vstrs.join()}${prefix}}`;
  };

  return internalStringify(basePrefix, { '': object }, '', object);
};

export { stringify as default };
