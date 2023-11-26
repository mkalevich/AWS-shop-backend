import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import * as dotenv from "dotenv";
import * as uuid from "uuid";
import { SERVER_STATUS_CODE, TABLE_NAME } from "../constants";
import { buildResponseBody, isValidProduct, logIncomingRequest } from "./helpers";
import { BuildResponse, NewProduct } from "./types";

dotenv.config();

const dynamoDB = new DynamoDB.DocumentClient({
  region: process.env.BASE_AWS_REGION,
});

const createProduct = async (data: NewProduct) => {
  const tableName = TABLE_NAME.PRODUCTS_DB;

  const { description, title, price } = data;

  const product = {
    id: uuid.v4(),
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

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<BuildResponse> => {
  logIncomingRequest(event, context);
  
  const product = !!event.body && JSON.parse(event.body);

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
