import { isValidProduct } from "./helpers";
import { createProduct } from "./createProduct";
import { SQSEvent } from "aws-lambda";
import { SNS } from "aws-sdk";

const sns = new SNS({ apiVersion: "2010-03-31" });

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

    const params = {
      Message: "Products created successfully!",
      TopicArn:
        "arn:aws:sns:us-east-1:946060570212:ProductServiceLambdaStack-createProductTopic05C0E62B-PHFB3qcNawrn",
    };

    sns.publish(params).promise();
  }
};
