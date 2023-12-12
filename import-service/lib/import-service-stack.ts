import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dotenv from "dotenv";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

dotenv.config();

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apiGateway.HttpApi(this, "ImportServiceApi", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    const importProductsFile = new NodejsFunction(this, "ImportProductsFile", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
      functionName: "importProductsFile",
      entry: "handlers/importProductsFile.ts",
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        "ImportProductsFileIntegration",
        importProductsFile
      ),
      path: "/import",
      methods: [apiGateway.HttpMethod.GET],
    });

    new NodejsFunction(this, "ImportFileParser", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
      functionName: "importFileParser",
      entry: "handlers/importFileParser.ts",
    });
  }
}
