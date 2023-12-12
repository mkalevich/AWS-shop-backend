import { isValidProduct } from "./helpers";
import { createProduct } from "./createProduct";
import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const product = JSON.parse(record.body);

      console.log(`Message recieved from SQS: ${JSON.stringify(product)}`);

      if (!isValidProduct(product)) {
        console.log("The Product is not valid");
      }

      await createProduct(product);

      console.log("The Product has been created");
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
};
