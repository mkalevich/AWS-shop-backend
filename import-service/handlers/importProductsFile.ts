import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { S3 } from "aws-sdk";
import { BuildResponse, buildResponseBody } from "../helpers";
import { config } from "dotenv";
import {
  PUT_OBJECT_OPERATION,
  bucketName,
  linkExpirationInSeconds,
} from "./constants";

config();

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<BuildResponse> => {
  const { name } = event.queryStringParameters ?? { name: "" };

  const s3 = new S3({ region: process.env.BASE_AWS_REGION });

  try {
    const signedUrl = s3.getSignedUrl(PUT_OBJECT_OPERATION, {
      Bucket: bucketName,
      ContentType: "text/csv",
      Key: `uploaded/${name}`,
      Expires: linkExpirationInSeconds,
    });

    return buildResponseBody({
      statusCode: 200,
      body: signedUrl,
    });
  } catch (error: unknown) {
    return buildResponseBody({
      statusCode: 500,
      body: { message: error },
    });
  }
};
