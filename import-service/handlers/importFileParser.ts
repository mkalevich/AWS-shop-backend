import { APIGatewayProxyEvent, Context, S3Event } from "aws-lambda";
import { BuildResponse, buildResponseBody } from "../helpers";
import { S3 } from "aws-sdk";
import * as csvParser from "csv-parser";

const s3 = new S3();

const parseS3CSVFile = async (bucket: string, key: string) => {
  const readStream = s3
    .getObject({
      Bucket: bucket,
      Key: key,
    })
    .createReadStream();

  readStream
    .pipe(csvParser())
    .on("data", (data: object) => {
      console.log(data);
    })
    .on("end", () => {
      console.log("Parsing CSV completed");
    })
    .on("error", (error: Error) => {
      console.log(error.message);
    });
};

export const handler = async (
  event: S3Event,
  context: Context
): Promise<BuildResponse> => {
  try {
    const { bucket, object } = event.Records[0].s3;
    await parseS3CSVFile(bucket.name, object.key);

    return buildResponseBody({
      statusCode: 200,
      body: { message: "CSV parse has been completed" },
    });
  } catch (error: unknown) {
    return buildResponseBody({
      statusCode: 500,
      body: { message: error },
    });
  }
};
