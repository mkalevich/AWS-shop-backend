import { DynamoDB } from "aws-sdk";
import * as dotenv from "dotenv";
import { SERVER_STATUS_CODE, TABLE_NAME } from "../constants";
import { buildResponseBody, isValidProduct } from "./helpers";
import { Product } from "../mock-db/types";

dotenv.config();

const dynamoDB = new DynamoDB.DocumentClient({
  region: process.env.BASE_AWS_REGION,
});

const createProduct = async (data: Product) => {
  const tableName = TABLE_NAME.PRODUCTS_DB;
  const { description, id, title, price } = data;
  const product = {
    id,
    title,
    description,
    price,
  };

  const params = {
    TableName: tableName,
    Item: product,
  };

  try {
    await dynamoDB.put(params).promise();
    console.log(`Product created: ${product}`);
  } catch (error: unknown) {
    throw Error(`${error} => error ${data}`);
  }
};

export const handler = async (event: any) => {
  const product = JSON.parse(event.body);

  if (isValidProduct(product)) {
    return buildResponseBody({
      statusCode: 400,
      body: `Product data is invalid!`,
    });
  }

  try {
    await createProduct(product);

    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.OK,
      body: `Product ${event.body} has been successfully added`,
    });
  } catch (error: unknown) {
    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.SERVER_ERROR,
      body: `Unable to create a product :( Error => ${error}`,
    });
  }
};
