import { products } from "../mock-db/products";
import { buildResponseBody } from "./helpers";

export async function handler(event: any) {
  try {
    const { productId } = event.pathParameters;
    const product = products.find((product) => product.id === productId) ?? [];

    return buildResponseBody({ statusCode: 200, body: product });
  } catch (error: unknown) {
    return buildResponseBody({ statusCode: 200, body: error });
  }
}
