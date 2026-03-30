#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApigwArbitraryKeysStack } from "../lib/apigw-arbitrary-keys-stack";

const app = new cdk.App();
new ApigwArbitraryKeysStack(app, "ApigwArbitraryKeysCdkStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
