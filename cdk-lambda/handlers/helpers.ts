import { BuildResponse } from "./types";

export const buildResponseBody = ({
  statusCode,
  body,
  headers,
}: BuildResponse): BuildResponse => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});
