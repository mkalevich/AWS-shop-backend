import { Lambda } from "aws-sdk";
import { buildResponseBody, isValidProduct } from "./helpers";
import { createProduct } from "./createProduct";
import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const product = JSON.parse(record.body);

      console.log(`Message recieved from SQS: ${JSON.stringify(product)}`);

      if (!isValidProduct(product)) {
        return buildResponseBody({
          statusCode: 400,
          body: { massage: "Product data is invalid!" },
        });
      }

      await createProduct(product);

      console.log("Created");
    } catch (error) {
      console.log(JSON.stringify("error"));
      console.log(JSON.stringify(error));
    }
  }
};
