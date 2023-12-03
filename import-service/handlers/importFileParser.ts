import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { BuildResponse, buildResponseBody } from "../helpers";
import { BASE_PATH } from "./constants";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<BuildResponse> => {
  const { name } = event.queryStringParameters ?? { name: "" };

  try {
    return buildResponseBody({
      statusCode: 200,
      body: `${BASE_PATH}/uploaded/${name}`,
    });
  } catch (error: unknown) {
    return buildResponseBody({
      statusCode: 500,
      body: { message: error },
    });
  }
};
