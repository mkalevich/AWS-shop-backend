import { Context, S3Event } from "aws-lambda";
import { BuildResponse, buildResponseBody } from "../helpers";
import { S3, SQS, config } from "aws-sdk";
import csvParser from "csv-parser";
import { bucketName } from "./constants";
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
const sqs = new SQS({ apiVersion: "2012-11-05", region: "us-east-1" });
const sqsClient = new SQSClient({ region: "us-east-1" });
config.update({ region: "us-east-1" });

const sendMessagesToSQS = async (messages: string[]) => {
  const queueUrl =
    "https://sqs.us-east-1.amazonaws.com/946060570212/ProductServiceLambdaStack-catalogItemsQueue79451959-TwFtGaE1EHAA";

  await sqsClient.send(
    new SendMessageBatchCommand({
      QueueUrl: queueUrl,
      Entries: messages.map((message, index) => ({
        Id: index.toString(),
        MessageBody: JSON.stringify(message),
      })),
    })
  );
};

const s3 = new S3();

const parseS3CSVFile = async (bucket: string, key: string) => {
  const csvData: any = [];

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
        console.log(chunk);
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

    await parseS3CSVFile(bucketName, key).then((data) =>
      sendMessagesToSQS(data)
    );

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
