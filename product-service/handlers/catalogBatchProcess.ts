import { Lambda } from "aws-sdk";
import { buildResponseBody, isValidProduct } from "./helpers";
import { createProduct } from "./createProduct";
import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  console.log(event.Records);
  console.log(Array.isArray(event.Records));

  for (const record of event.Records) {
    try {
      console.log(`Message recieved from SQS: ${JSON.parse(record.body)}`);

      if (isValidProduct(JSON.parse(record.body))) {
        return buildResponseBody({
          statusCode: 400,
          body: { massage: "Product data is invalid!" },
        });
      }

      await createProduct(JSON.parse(record.body));

      return buildResponseBody({
        statusCode: 200,
        body: { message: "Created" },
      });
    } catch (error) {
      return buildResponseBody({ statusCode: 500, body: { message: error } });
    }
  }
};
