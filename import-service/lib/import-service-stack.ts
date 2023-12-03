import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
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

    // const importFileParser = new NodejsFunction(this, "ImportFileParser", {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
    //   functionName: "importFileParser",
    //   entry: "handlers/importFileParser.ts",
    // });

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

    // api.addRoutes({
    //   integration: new HttpLambdaIntegration(
    //     "ImportFileParserIntegration",
    //     importFileParser
    //   ),
    //   path: "/import",
    //   methods: [apiGateway.HttpMethod.GET],
    // });
  }
}
