import * as AWS from "aws-sdk";
import { QueryCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { config } from "dotenv";
import { SERVER_STATUS_CODE, TABLE_NAME } from "../constants";
import { buildResponseBody, logIncomingRequest } from "./helpers";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { BuildResponse } from "./types";

config();

const getProductById = async (productId: string) => {
  const dynamoDB = new DynamoDBClient({ region: process.env.BASE_AWS_REGION });

  const params = {
    TableName: TABLE_NAME.PRODUCTS_DB,
    KeyConditionExpression: "id = :productId",
    ExpressionAttributeValues: {
      ":productId": { S: productId },
    },
  };

  try {
    const query = new QueryCommand(params);
    const response = await dynamoDB.send(query);

    const isProductExists = response.Items && response.Items.length > 0;

    if (isProductExists) {
      const product = AWS.DynamoDB.Converter.unmarshall(response.Items?.[0]!);

      return product;
    }

    return null;
  } catch (error: unknown) {
    throw Error("Unable to get product from Data Base :(");
  }
};

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<BuildResponse> => {
  logIncomingRequest(event, context);

  try {
    const { productId } = event.pathParameters ?? { productId: "" };

    const product = await getProductById(productId!);

    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.OK,
      body: product,
    });
  } catch (error: unknown) {
    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.SERVER_ERROR,
      body: { message: `Unable to get data from table :( ${error})` },
    });
  }
};
