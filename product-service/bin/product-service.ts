#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service-stack";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { config } from "dotenv";
import { LAMBDA_FUNCTION_NAMES, PRODUCTS_API, STACK_NAME } from "../constants";

config();

const app = new cdk.App();

export const stack = new ProductServiceStack(app, STACK_NAME, {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.BASE_AWS_REGION,
  },
});

const getProductsList = new NodejsFunction(
  stack,
  LAMBDA_FUNCTION_NAMES.GET_PRODUCTS_LIST,
  {
    runtime: lambda.Runtime.NODEJS_18_X,
    environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
    functionName: "getProductsList",
    entry: "handlers/getProductsList.ts",
  }
);

const getProductById = new NodejsFunction(
  stack,
  LAMBDA_FUNCTION_NAMES.GET_PRODUCT_BY_ID,
  {
    runtime: lambda.Runtime.NODEJS_18_X,
    environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
    functionName: "getProductById",
    entry: "handlers/getProductById.ts",
  }
);

const createProduct = new NodejsFunction(
  stack,
  LAMBDA_FUNCTION_NAMES.CREATE_PRODUCT,
  {
    runtime: lambda.Runtime.NODEJS_18_X,
    environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
    functionName: "createProduct",
    entry: "handlers/createProduct.ts",
  }
);

const api = new apiGateway.HttpApi(stack, PRODUCTS_API, {
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
    "GetProductByIdIntegration",
    getProductById
  ),
  path: "/products/{productId}",
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "CreateProductIntegration",
    createProduct
  ),
  path: "/products",
  methods: [apiGateway.HttpMethod.POST],
});