export class ClientError extends Error {
  static is(err: unknown): err is ClientError {
    return err instanceof ClientError;
  }

  readonly httpStatus;
  readonly httpResponseText;

  constructor(msg: string, httpResponseText: string, httpStatus: number, cause?: Error) {
    super(msg, { cause });
    this.httpStatus = httpStatus;
    this.httpResponseText = httpResponseText;
  }
}
