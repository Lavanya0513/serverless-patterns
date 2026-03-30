import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const tenantId = event.authorizationToken;

  if (!tenantId) {
    throw new Error("Unauthorized: No tenant ID provided");
  }

  try {
    const result = await client.send(
      new GetItemCommand({
        TableName: TABLE_NAME,
        Key: { tenantId: { S: tenantId } },
      }),
    );

    if (!result.Item || !result.Item.apiKey) {
      throw new Error("Unauthorized: Tenant not found");
    }

    const apiKey = result.Item.apiKey.S;

    const authResponse = {
      principalId: tenantId,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Resource: event.methodArn,
            Action: "execute-api:Invoke",
          },
        ],
      },
      context: { tenantId },
      usageIdentifierKey: apiKey,
    };

    return authResponse;
  } catch (error) {
    console.error("Authorization error:", error.message);
    throw new Error("Unauthorized");
  }
};
