import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { BuildResponse, NewProduct } from "./types";

export const buildResponseBody = ({
  statusCode,
  body,
  headers,
}: BuildResponse): BuildResponse => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

export const isValidProduct = (productData: NewProduct) => {
  const { description = null, title = null, price = null } = { ...productData };
  if (
    !description ||
    typeof description !== "string" ||
    !title ||
    typeof title !== "string" ||
    !price ||
    typeof price !== "number"
  ) {
    return true;
  }

  return false;
};

export const logIncomingRequest = (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  console.log(event, context);
};
