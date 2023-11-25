import { Product } from "../mock-db/types";
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

export const isValidProduct = (productData: Product) => {
  const {
    id = null,
    description = null,
    title = null,
    price = null,
  } = { ...productData };
  if (
    !id ||
    typeof id !== "string" ||
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
