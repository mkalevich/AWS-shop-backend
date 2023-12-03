#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ImportServiceStack } from "../lib/import-service-stack";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { config } from "dotenv";

config();

const app = new cdk.App();
const stack = new ImportServiceStack(app, "ImportServiceStack", {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.BASE_AWS_REGION,
  },
});

const importProductsFile = new NodejsFunction(stack, "ImportProductsFile", {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
  functionName: "importProductsFile",
  entry: "handlers/importProductsFile.ts",
});

const api = new apiGateway.HttpApi(stack, "ImportServiceApi", {
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
