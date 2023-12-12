import { Context, S3Event } from "aws-lambda";
import {
  BuildResponse,
  buildResponseBody,
  sendMessagesToSQS,
} from "../helpers";
import { S3, config } from "aws-sdk";
import csvParser from "csv-parser";
import * as dotenv from "dotenv";
import { bucketName } from "./constants";

dotenv.config();

config.update({ region: process.env.BASE_AWS_REGION });

const s3 = new S3();

const parseS3CSVFile = async (bucket: string, key: string) => {
  const csvData: object[] = [];

  return new Promise((resolve, reject) => {
    const readStream = s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .createReadStream();

    readStream
      .pipe(csvParser())
      .on("data", (chunk: object) => {
        csvData.push(chunk);
      })
      .on("end", () => {
        console.log("Parsing CSV completed");
        resolve(csvData);
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

    const products = await parseS3CSVFile(bucketName, key);

    const queueUrl =
      "https://sqs.us-east-1.amazonaws.com/946060570212/ProductServiceLambdaStack-catalogItemsQueue79451959-TwFtGaE1EHAA";
    await sendMessagesToSQS(products, queueUrl);

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
