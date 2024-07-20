import test from 'node:test';
import * as assert from 'node:assert';
import * as actual from '../src/stable.ts';
import type * as types from '../types.d.ts';

const { stringify } = actual;

// will squiggle if wrong
const checkExport: typeof types = actual;

const complexObject = {
  b: undefined,
  c: [
    1,
    Symbol('butt'),
    {
      a: 2,
      0: 'foo',
    },
  ],
  a: 3,
};

const hasRawJSON = 'isRawJSON' in JSON;
test('raw json', { skip: !hasRawJSON }, () => {
  const raw = JSON.rawJSON('"hello"');
  assert.strictEqual(stringify({ check: raw }), '{"check":"hello"}');
});

test('no config', () => {
  const checks: { from: any; to: string }[] = [
    {
      from: {},
      to: '{}',
    },
    {
      from: { b: 2, d: undefined, a: 1, c: null },
      to: '{"a":1,"b":2,"c":null}',
    },
  ];

  for (const { from, to } of checks) {
    assert.strictEqual(stringify(from), to);
  }
});

test('space', () => {
  assert.strictEqual(
    stringify(complexObject, { space: 2 }),
    `{
  "a": 3,
  "c": [
    1,
    null,
    {
      "0": "foo",
      "a": 2
    }
  ]
}`,
  );
});

test('helpers', () => {
  const o = {
    a: {
      toJSON() {
        return 1;
      },
    },
    b: {
      hello: 'there',
      [Symbol.toPrimitive]() {
        return 2;
      },
    },
  };

  assert.strictEqual(
    stringify(o, { space: 1 }),
    `{
 "a": 1,
 "b": {
  "hello": "there"
 }
}`,
  );
});

JSON.stringify;

test('throws', () => {
  const a: any[] = [];
  a.push(a);

  assert.throws(() => stringify(a));
});

test('replacer', () => {
  const o = { a: 1, b: 2, c: false };
  const replacer: types.Replacer = (key, value) => {
    if (value === 1) {
      return 'one';
    }
    if (value === 2) {
      return 'two';
    }
    return value;
  };

  assert.strictEqual(stringify(o, { replacer }), '{"a":"one","b":"two","c":false}');
});
