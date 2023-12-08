export const enum TABLE_NAME {
  PRODUCTS_DB = "ProductsDB",
  STOCKS_DB = "StocksDB",
}

export const enum SERVER_STATUS_CODE {
  SERVER_ERROR = 500,
  OK = 200,
}

export const enum LAMBDA_FUNCTION_NAMES {
  GET_PRODUCTS_LIST = "GetProductsList",
  GET_PRODUCT_BY_ID = "GetProductById",
  CREATE_PRODUCT = "CreateProduct",
}

export const STACK_NAME = "ProductServiceLambdaStack";
export const PRODUCTS_API = "ProductsApi";
