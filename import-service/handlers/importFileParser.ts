import { Context, S3Event } from "aws-lambda";
import { BuildResponse, buildResponseBody } from "../helpers";
import { S3, SQS, config } from "aws-sdk";
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

        sendMessageToSQS(data);
      })
      .on("end", (records) => {
        console.log("Parsing CSV completed");
        resolve(records);
      })
      .on("error", (error: Error) => {
        console.log(error.message);
        reject(error.message);
      });
  });
};

const sqs = new SQS({ apiVersion: "2012-11-05" });
config.update({ region: "us-east-1" });

const sendMessageToSQS = (message: any) => {
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl:
      "https://sqs.us-east-1.amazonaws.com/946060570212/ProductServiceLambdaStack-catalogItemsQueue79451959-7TgjTXSaxWkE",
  };

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log("Error ", err);
    } else {
      console.log("Success ", data.MessageId);
    }
  });
};

export const handler = async (
  event: S3Event,
  context: Context
): Promise<BuildResponse> => {
  try {
    const { object } = event.Records[0].s3;
    const key = decodeURIComponent(object.key.replace(/\+/g, " "));

    const records = await parseS3CSVFile(bucketName, key);

    records?.forEach((element) => {
      console.log("Records =>");
      console.log(element);
      sendMessageToSQS(element);
    });

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
