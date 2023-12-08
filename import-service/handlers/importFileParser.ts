import { APIGatewayProxyEvent, Context, S3Event } from "aws-lambda";
import { BuildResponse, buildResponseBody } from "../helpers";
import { S3 } from "aws-sdk";
import csvParser from "csv-parser";
import { bucketName } from "./constants";

const s3 = new S3();

const parseS3CSVFile = async (bucket: string, key: string) => {
  console.log(`Key ${key}`);
  return new Promise((resolve, reject) => {
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
        resolve("Parsing CSV completed");
      })
      .on("error", (error: Error) => {
        console.log(error.message);
        reject(error.message);
      });
  });
};

export const handler = async (
  event: S3Event,
  context: Context
): Promise<BuildResponse> => {
  try {
    const { object } = event.Records[0].s3;
    const key = decodeURIComponent(object.key.replace(/\+/g, " "));

    await parseS3CSVFile(bucketName, key);

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
