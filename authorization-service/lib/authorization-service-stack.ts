import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IAM, Lambda, config } from "aws-sdk";
import * as dotenv from "dotenv";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const role = new Role(this, "LambdaExecutionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    role.addToPolicy(
      new PolicyStatement({
        actions: ["lambda:UpdateFunctionConfiguration"],
        resources: ["*"],
      })
    );

    const basicAuthorizer = new NodejsFunction(this, "basicAuthorizer", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        BASE_AWS_REGION: process.env.BASE_AWS_REGION!,
        GITHUB_LOGIN: process.env.GITHUB_LOGIN!,
        GITHUB_PASSWORD: process.env.GITHUB_PASSWORD!,
      },
      functionName: "basicAuthorizer",
      entry: "handlers/basicAuthorizer.ts",
      role: role,
    });

    new cdk.CfnOutput(this, "basicAuthorizerExport", {
      value: basicAuthorizer.functionArn,
      exportName: "basicAuthorizerArn",
    });
  }
}
