import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Lambda, S3 } from "aws-sdk";
import { bucketName, s3Event } from "../handlers/constants";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importProductsFile = new NodejsFunction(this, "ImportProductsFile", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
      functionName: "importProductsFile",
      entry: "handlers/importProductsFile.ts",
    });

    const importFileParser = new NodejsFunction(this, "ImportFileParser", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
      functionName: "importFileParser",
      entry: "handlers/importFileParser.ts",
    });

    const api = new apiGateway.HttpApi(this, "ImportServiceApi", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        "ImportProductsFileIntegration",
        importProductsFile
      ),
      path: "/import",
      methods: [apiGateway.HttpMethod.GET],
    });

    const setupS3EventNotifications = async () => {
      const s3 = new S3({ region: "us-east-1" });

      try {
        const lambda = new Lambda({ region: "us-east-1" });
        await lambda
          .addPermission({
            FunctionName: "importFileParser",
            StatementId: "s3-trigger",
            Action: "lambda:InvokeFunction",
            Principal: "s3.amazonaws.com",
            SourceArn: `arn:aws:s3:::${bucketName}`,
          })
          .promise();

        const bucketNotificationParams = {
          Bucket: bucketName,
          NotificationConfiguration: {
            LambdaFunctionConfigurations: [
              {
                LambdaFunctionArn:
                  "arn:aws:lambda:us-east-1:946060570212:function:importFileParser",
                Events: [s3Event],
                Filter: {
                  Key: {
                    FilterRules: [
                      {
                        Name: "prefix",
                        Value: "uploaded/",
                      },
                    ],
                  },
                },
              },
            ],
          },
        };

        await s3.putBucketNotificationConfiguration(
          bucketNotificationParams,
          (err, data) => {
            if (err) {
              console.log(err.message);
            } else {
              console.log(`Event notification added successfully: ${data}`);
            }
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

    setupS3EventNotifications();
  }
}
