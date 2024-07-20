export type Replacer = (this: Record<string, any>, key: string, value: any) => any;

export function stringify(
  object: any,
  replacer?: Replacer | null,
  space?: number | string,
): string | undefined;

export default stringify;
