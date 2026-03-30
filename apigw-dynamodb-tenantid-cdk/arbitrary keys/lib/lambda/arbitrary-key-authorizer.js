import { APIGatewayClient, GetUsagePlansCommand } from "@aws-sdk/client-api-gateway";
import { randomBytes } from "crypto";

const apigwClient = new APIGatewayClient();

exports.handler = async (event) => {
  const tenantId = event.authorizationToken;
  if (!tenantId) {
    throw new Error("Unauthorized");
  }

  // arn:aws:execute-api:{region}:{account}:{apiId}/{stage}/{method}/{resource}
  const arnParts = event.methodArn.split(":");
  const apiGatewayArnPart = arnParts[5].split("/");
  const apiId = apiGatewayArnPart[0];
  const stage = apiGatewayArnPart[1];

  // Generate arbitrary key (128 chars max)
  const usageIdentifierKey = randomBytes(64).toString("hex").substring(0, 128);

  // Find usage plan associated with this API's stage
  let usagePlanId;
  try {
    const resp = await apigwClient.send(new GetUsagePlansCommand({}));
    const plan = resp.items?.find((p) =>
      p.apiStages?.some((s) => s.apiId === apiId && s.stage === stage)
    );
    if (plan) {
      usagePlanId = plan.id;
    }
  } catch (err) {
    console.error("Error fetching usage plans:", err.message);
  }

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
    usageIdentifierKey,
  };

  if (usagePlanId) {
    authResponse.usagePlanId = usagePlanId;
  }

  return authResponse;
};
