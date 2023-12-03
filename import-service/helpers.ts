export interface BuildResponse {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
}

export const buildResponseBody = ({
  statusCode,
  body,
  headers,
}: BuildResponse): BuildResponse => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});
