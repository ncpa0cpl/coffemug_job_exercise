import type { NextFunction, Request, Response } from "express";
import { ClientError } from "./utils/client_error.ts";
import { SqlGetError } from "./utils/sql_get_error.ts";

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  if (SqlGetError.is(err)) {
    res.type("text/plain").status(404).send("Not Found");
    return;
  }

  if (ClientError.is(err)) {
    console.error(`client error in a route handler, (url=${req.originalUrl}):\n`, err);
    res.type("text/plain").status(err.httpStatus).send(err.httpResponseText);
    return;
  }

  console.error(`unhandled error in a route handler, (url=${req.originalUrl}):\n`, err);
  res.type("text/plain").status(500).send("Internal server error");
}
