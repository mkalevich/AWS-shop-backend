#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service-stack";
import { config } from "dotenv";
import { STACK_NAME } from "../constants";

config();

const app = new cdk.App();

new ProductServiceStack(app, STACK_NAME, {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.BASE_AWS_REGION,
  },
});
