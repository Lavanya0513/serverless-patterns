# Amazon API Gateway with AWS Lambda Authorizer and DynamoDB for API Key Authentication

This pattern demonstrates how to implement a secure API key-based authorization system using Amazon API Gateway, AWS Lambda Authorizer, and Amazon DynamoDB. A DynamoDB table stores the mapping between tenant IDs and API keys. The Lambda authorizer validates the tenant ID from the request header, retrieves the corresponding API key from DynamoDB, and returns a policy document enabling API Gateway access.

Learn more about this pattern at Serverless Land Patterns: [https://serverlessland.com/patterns/apigw-dynamodb-apikey-cdk](https://serverlessland.com/patterns/apigw-dynamodb-apikey-cdk)

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Requirements

* [Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and log in. The IAM user that you use must have sufficient permissions to make necessary AWS service calls and manage AWS resources.
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed and configured
* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed
* [Node.js and npm](https://nodejs.org/) installed
* [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) installed

## Deployment Instructions

1. Create a new directory, navigate to that directory in a terminal and clone the GitHub repository:
    ```
    git clone https://github.com/aws-samples/serverless-patterns
    ```
1. Change directory to the pattern directory:
    ```
    cd apigw-dynamodb-apikey-cdk
    ```
1. Install dependencies:
    ```
    npm install
    ```
1. Deploy the stack:
    ```
    cdk deploy
    ```

Note the outputs from the CDK deployment process. The output will include the API Gateway URL and the DynamoDB table name you'll need for testing.

## How it works

![Architecture Diagram](./apigw-dynamodb-apikey-cdk.drawio)

1. Client makes a request to the API with a tenant ID in the `x-tenant-id` header
2. API Gateway forwards the authorization request to the Lambda Authorizer
3. The Lambda Authorizer looks up the tenant ID in the DynamoDB table
   - If the tenant exists, the associated API key is retrieved and returned in the authorization context via `usageIdentifierKey`
   - If the tenant does not exist, the request is denied
4. The API Gateway allows or denies access to the protected endpoint based on the policy returned by the authorizer

The DynamoDB table uses `tenantId` as the partition key and stores the corresponding `apiKey` for each tenant.

## Testing

1. Get the DynamoDB table name and API Gateway URL from the deployment output:
    ```bash
    # The outputs will be similar to
    ApigwDynamodbApikeyCdkStack.ApiUrl = https://abc123def.execute-api.us-east-1.amazonaws.com/prod/
    ApigwDynamodbApikeyCdkStack.TableName = ApigwDynamodbApikeyCdkStack-TenantApiKeyTableXXXXXX-YYYYYY
    ```

1. Insert a tenant mapping into the DynamoDB table:
    ```bash
    aws dynamodb put-item \
      --table-name TABLE_NAME \
      --item '{"tenantId": {"S": "sample-tenant"}, "apiKey": {"S": "my-api-key-123"}}'
    ```

1. Make a request to the protected endpoint with a valid tenant ID:
    ```bash
    curl -H "x-tenant-id: sample-tenant" https://REPLACE_WITH_API_URL/protected
    ```
    If successful, you should receive a response like:
    ```json
    { "message": "Access granted" }
    ```

1. Try with an invalid tenant ID:
    ```bash
    curl -H "x-tenant-id: invalid-tenant" https://REPLACE_WITH_API_URL/protected
    ```
    You should receive an unauthorized error.

1. Try without a tenant ID:
    ```bash
    curl https://REPLACE_WITH_API_URL/protected
    ```
    You should also receive an unauthorized error.

## Cleanup

1. Delete the stack:
    ```bash
    cdk destroy
    ```

----
Copyright 2025 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0
