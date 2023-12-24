import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";

export interface BuildResponse {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
}

export const buildResponseBody = ({
  statusCode,
  body,
  headers,
}: BuildResponse): BuildResponse => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

export const sendMessagesToSQS = async (
  messages: string[],
  queueUrl: string
) => {
  const sqsClient = new SQSClient({ region: "us-east-1" });

  try {
    await sqsClient.send(
      new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: messages.map((message, index) => ({
          Id: index.toString(),
          MessageBody: JSON.stringify(message),
        })),
      })
    );
  } catch (e) {
    console.log(JSON.stringify(e));
  }
};
