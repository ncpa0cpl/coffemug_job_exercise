export function assertDefined<T>(value: T | undefined | null, msg?: string): asserts value is T {
  if (value != null) {
    return;
  }
  throw new Error("Assertion failed: value is undefined. " + msg);
}
