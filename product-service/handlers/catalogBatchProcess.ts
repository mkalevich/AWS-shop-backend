import { Lambda } from "aws-sdk";
import { LAMBDA_FUNCTION_NAMES } from "../constants";
import { buildResponseBody } from "./helpers";

const lambda = new Lambda();

export const handler = async (event: any) => {
  const getParams = (payload: any) => {
    const params = {
      FunctionName: LAMBDA_FUNCTION_NAMES.CREATE_PRODUCT,
      Payload: JSON.stringify(payload),
    };

    return params;
  };

  try {
    for (const record of event.Records) {
      console.log(`Message recieved from SQS: ${record.body}`);

      const result = await lambda.invoke(getParams(record.body)).promise();

      let payload;

      if (Buffer.isBuffer(result.Payload)) {
        payload = result.Payload.toString("utf-8");
      }

      const resultPayload = JSON.parse(payload ?? "");

      return buildResponseBody({
        statusCode: 200,
        body: { message: resultPayload },
      });
    }
  } catch (error) {
    return buildResponseBody({ statusCode: 500, body: { message: error } });
  }
};
