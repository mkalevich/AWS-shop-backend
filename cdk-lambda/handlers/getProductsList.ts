import * as AWS from "aws-sdk";
import { ItemList } from "aws-sdk/clients/dynamodb";
import { config } from "dotenv";
import { SERVER_STATUS_CODE, TABLE_NAME } from "../constants";
import { buildResponseBody, logIncomingRequest } from "./helpers";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { BuildResponse } from "./types";

config();

AWS.config.update({ region: process.env.BASE_AWS_REGION });

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const scanTable = async (tableName: string): Promise<ItemList | undefined> => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
    };

    dynamoDB.scan(params, (err, data) => {
      if (err) {
        console.log("Error while scanning.");
        reject(err);
      } else {
        resolve(data.Items);
      }
    });
  });
};

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<BuildResponse> => {
  logIncomingRequest(event, context);

  try {
    const productsTable = await scanTable(TABLE_NAME.PRODUCTS_DB);
    const stocksTable = await scanTable(TABLE_NAME.STOCKS_DB);

    const combinedTables = productsTable?.map((product) => {
      const currentStock =
        stocksTable?.find((stock) => stock.product_id === product.id) ?? {};

      const { product_id, ...restData } = currentStock;

      return {
        ...restData,
        ...product,
      };
    });

    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.OK,
      body: combinedTables,
    });
  } catch (error: unknown) {
    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.SERVER_ERROR,
      body: `Unable to get data from tables :( ${error})`,
    });
  }
};
