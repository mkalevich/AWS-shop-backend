#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkLambdaStack } from "../lib/cdk-lambda-stack";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { config } from "dotenv";

config();

const app = new cdk.App();

export const stack = new CdkLambdaStack(app, "CdkLambdaStack", {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.BASE_AWS_REGION,
  },
});

const getProductsList = new NodejsFunction(stack, "GetProductsListLambda", {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
  functionName: "getProductsListFunc",
  entry: "handlers/getProductsList.ts",
});

const getProductById = new NodejsFunction(stack, "GetProductsListLambdaV2", {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
  functionName: "getProductById",
  entry: "handlers/getProductById.ts",
});

const createProduct = new NodejsFunction(stack, "GetProductsListLambdaV3", {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
  functionName: "createProduct",
  entry: "handlers/createProduct.ts",
});

const api = new apiGateway.HttpApi(stack, "ProductApi", {
  corsPreflight: {
    allowHeaders: ["*"],
    allowOrigins: ["*"],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "GetProductsListIntegration",
    getProductsList
  ),
  path: "/products",
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "GetProductsListIntegration",
    getProductById
  ),
  path: "/products/{productId}",
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "GetProductsListIntegration",
    createProduct
  ),
  path: "/products",
  methods: [apiGateway.HttpMethod.POST],
});
