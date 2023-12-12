import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LAMBDA_FUNCTION_NAMES, PRODUCTS_API, STACK_NAME } from "../constants";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import * as dotenv from "dotenv";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

dotenv.config();

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsList = new NodejsFunction(
      this,
      LAMBDA_FUNCTION_NAMES.GET_PRODUCTS_LIST,
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
        functionName: "getProductsList",
        entry: "handlers/getProductsList.ts",
      }
    );

    const getProductById = new NodejsFunction(
      this,
      LAMBDA_FUNCTION_NAMES.GET_PRODUCT_BY_ID,
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
        functionName: "getProductById",
        entry: "handlers/getProductById.ts",
      }
    );

    const createProduct = new NodejsFunction(
      this,
      LAMBDA_FUNCTION_NAMES.CREATE_PRODUCT,
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: { BASE_AWS_REGION: process.env.BASE_AWS_REGION! },
        functionName: "createProduct",
        entry: "handlers/createProduct.ts",
      }
    );

    const catalogItemsQueue = new Queue(this, "catalogItemsQueue");

    const role = new Role(this, "LambdaExecutionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    role.addToPolicy(
      new PolicyStatement({
        actions: ["sns:Publish"],
        resources: ["*"],
      })
    );

    const catalogBatchProcess = new NodejsFunction(
      this,
      "CatalogBatchProcess",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: { SQS_QUEUE_URL: catalogItemsQueue.queueUrl },
        functionName: "catalogBatchProcess",
        entry: "handlers/catalogBatchProcess.ts",
        role: role,
      }
    );

    catalogBatchProcess.addEventSource(
      new SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );

    catalogBatchProcess.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [catalogItemsQueue.queueArn],
        actions: ["*"],
      })
    );

    catalogItemsQueue.grantSendMessages(catalogBatchProcess);

    const api = new apiGateway.HttpApi(this, PRODUCTS_API, {
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

    const topic = new Topic(this, "createProductTopic");
    const emailSubscription = new EmailSubscription(
      process.env.PERSONAL_EMAIL!
    );
    topic.addSubscription(emailSubscription);
  }
}
