import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class SpaceflipPaymentBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const paymentsTable = new dynamodb.Table(this, 'PaymentsTable', {
      tableName: 'spaceflip-payments',
      partitionKey: { name: 'deviceId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const checkPaymentFunction = new lambda.Function(this, 'CheckPaymentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
        const client = new DynamoDBClient({});
        
        exports.handler = async (event) => {
          const deviceId = event.pathParameters.deviceId;
          const result = await client.send(new GetItemCommand({
            TableName: 'spaceflip-payments',
            Key: { deviceId: { S: deviceId } }
          }));
          
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ hasPaid: !!result.Item })
          };
        };
      `),
    });

    const processPaymentFunction = new lambda.Function(this, 'ProcessPaymentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
        const client = new DynamoDBClient({});
        
        exports.handler = async (event) => {
          const { deviceId } = JSON.parse(event.body);
          await client.send(new PutItemCommand({
            TableName: 'spaceflip-payments',
            Item: {
              deviceId: { S: deviceId },
              timestamp: { S: new Date().toISOString() }
            }
          }));
          
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true })
          };
        };
      `),
    });

    paymentsTable.grantReadData(checkPaymentFunction);
    paymentsTable.grantWriteData(processPaymentFunction);

    const api = new apigateway.RestApi(this, 'SpaceflipApi', {
      restApiName: 'Spaceflip Payment API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const payments = api.root.addResource('payments');
    payments.addResource('{deviceId}').addMethod('GET', new apigateway.LambdaIntegration(checkPaymentFunction));
    payments.addMethod('POST', new apigateway.LambdaIntegration(processPaymentFunction));
  }
}
