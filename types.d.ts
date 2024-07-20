export type KeyValue = {
  key: string;
  value: any;
};

export type Replacer = (this: Record<string, any>, key: string, value: any) => any;

export type Comparator = (a: KeyValue, b: KeyValue, getter: { get(key: string): any }) => number;

export type Options = {
  space: number | string;
  cycles: boolean;
  replacer: Replacer;
  cmp: Comparator;
};

export function stringify(object: any, options?: Partial<Options>): string | undefined;

export default stringify;
