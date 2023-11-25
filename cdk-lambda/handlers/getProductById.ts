import * as AWS from "aws-sdk";
import { QueryCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { config } from "dotenv";
import { SERVER_STATUS_CODE, TABLE_NAME } from "../constants";
import { buildResponseBody } from "./helpers";

config();

const getProductById = async (productId: string) => {
  const client = new DynamoDBClient({ region: process.env.BASE_AWS_REGION });

  const params = {
    TableName: TABLE_NAME.PRODUCTS_DB,
    KeyConditionExpression: "id = :productId",
    ExpressionAttributeValues: {
      ":productId": { S: productId },
    },
  };

  try {
    const query = new QueryCommand(params);
    const response = await client.send(query);

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

export const handler = async (event: any) => {
  try {
    const { productId } = event.pathParameters;

    const product = await getProductById(productId);

    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.OK,
      body: product,
    });
  } catch (error: unknown) {
    return buildResponseBody({
      statusCode: SERVER_STATUS_CODE.SERVER_ERROR,
      body: `Unable to get data from table :( ${error})`,
    });
  }
};
