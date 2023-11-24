import { products } from "../mock-db/products";
import { buildResponseBody } from "./helpers";

export async function handler(event: any) {
  try {
    return buildResponseBody({ statusCode: 200, body: products });
  } catch (error: unknown) {
    return buildResponseBody({ statusCode: 200, body: error });
  }
}
