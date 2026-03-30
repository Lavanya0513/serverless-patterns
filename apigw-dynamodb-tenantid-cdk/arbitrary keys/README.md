# API Gateway with Arbitrary Usage Identifier Keys (AUIK)

This pattern demonstrates API Gateway with a Lambda authorizer that returns arbitrary usage identifier keys per the [AUIK specification](https://w.amazon.com/bin/view/AWS/Mobile/API_Gateway/Onboarding/Arbitrary_Usage_Identifier_Keys).

## How it works

1. Client sends a request with `x-tenant-id` header
2. API Gateway forwards to the Lambda authorizer
3. The authorizer:
   - Extracts the **stage** from the method ARN
   - Generates a random 128-character arbitrary API key
   - Calls `GetUsagePlans` to find a usage plan associated with the API + stage
   - Returns `usageIdentifierKey` (always) and `usagePlanId` (if a plan exists for the stage)
4. API Gateway uses the returned key for throttling/quota enforcement against the usage plan

Per the AUIK docs: if no `usagePlanId` is returned, API Gateway treats `usageIdentifierKey` as a configured API Key.

## Authorizer Response Format

```json
{
  "principalId": "tenant-id",
  "policyDocument": { ... },
  "usageIdentifierKey": "<128-char-random-key>",
  "usagePlanId": "<usage-plan-id>"
}
```

## Prerequisites

- AWS account allowlisted 
- Node.js, npm, AWS CDK installed

## Deploy

```bash
cd arbitrary-keys
npm install
cdk deploy
```

## Test

```bash
# Hit prod stage (has usage plan)
curl -H "x-tenant-id: my-tenant" https://<api-id>.execute-api.<region>.amazonaws.com/prod/protected

# Hit dev stage (has usage plan)
curl -H "x-tenant-id: my-tenant" https://<api-id>.execute-api.<region>.amazonaws.com/dev/protected

# Without tenant ID (should fail)
curl https://<api-id>.execute-api.<region>.amazonaws.com/prod/protected
```

## Cleanup

```bash
cdk destroy
```
