import { Product } from "../mock-db/types";

export interface BuildResponse {
  statusCode: number;
  body: Product[] | unknown;
  headers?: Record<string, string>;
}

export type NewProduct = Omit<Product, "id">;
