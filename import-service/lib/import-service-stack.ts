import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dotenv from "dotenv";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { bucketName } from "../handlers/constants";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-lambda-destinations";
import { AuthorizationType } from "aws-cdk-lib/aws-apigateway";

dotenv.config();

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apiGateway.RestApi(this, "ImportServiceApi", {
      restApiName: "Service API",
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowCredentials: true,
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
    });

    const importProductsFile = new NodejsFunction(this, "ImportProductsFile", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
      functionName: "importProductsFile",
      entry: "handlers/importProductsFile.ts",
    });

    const importProductsFileIntegration = new apiGateway.LambdaIntegration(
      importProductsFile
    );

    const importedBasicAuthorizerArn = cdk.Fn.importValue("basicAuthorizerArn");
    const authorizerFunction = lambda.Function.fromFunctionArn(
      this,
      "importedBasicAuthorizerArn",
      importedBasicAuthorizerArn
    );

    const authorizer = new apiGateway.TokenAuthorizer(this, "Authorizer", {
      handler: authorizerFunction,
    });

    api.root
      .addResource("import")
      .addMethod("GET", importProductsFileIntegration, {
        authorizer,
        authorizationType: AuthorizationType.CUSTOM,
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      });

    const importFileParser = new NodejsFunction(this, "ImportFileParser", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
      functionName: "importFileParser",
      entry: "handlers/importFileParser.ts",
    });

    const importServiceBucketUploaded = Bucket.fromBucketName(
      this,
      "ImportServiceBucketUploaded",
      bucketName
    ) as Bucket;

    importFileParser.addEventSource(
      new S3EventSource(importServiceBucketUploaded, {
        events: [EventType.OBJECT_CREATED],
        filters: [
          {
            prefix: "uploaded/",
          },
        ],
      })
    );
  }
}
