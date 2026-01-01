export class SqlGetError extends Error {
  static is(err: unknown): err is SqlGetError {
    return err instanceof SqlGetError;
  }

  constructor(query: string) {
    super("record does not exist: " + query);
  }
}
