import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IAM } from "aws-sdk";
import * as dotenv from "dotenv";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new NodejsFunction(this, "basicAuthorizer", {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        BASE_AWS_REGION: process.env.BASE_AWS_REGION!
      },
      functionName: "basicAuthorizer",
      entry: "handlers/basicAuthorizer.ts",
    });

    const iam = new IAM();

    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["lambda.UpdateFunctionConfiguration"],
          Resource:
            "arn:aws:lambda:us-east-1:946060570212:function:basicAuthorizer",
        },
      ],
    };

    const policyParams = {
      PolicyDocument: JSON.stringify(policy),
      PolicyName: "LambdaUpdateConfigurationPolicy",
    };

    iam.createPolicy(policyParams, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
      }
    });

    const attachRolePolicyParams = {
      PolicyArn:
        "arn:aws:iam:946060570212:policy/LambdaUpdateConfigurationPolicy",
      RoleName: "BasicAuthorizerRole",
    };

    iam.attachRolePolicy(attachRolePolicyParams, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
      }
    });
  }
}
