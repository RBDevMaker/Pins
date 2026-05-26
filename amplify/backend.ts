import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

/**
 * Amplify Gen 2 backend definition.
 * Add auth when ready: import { auth } from './auth/resource';
 */
const backend = defineBackend({
  data,
  storage,
});

// --- Bedrock Knowledge Base data source ---
const knowledgeBaseDataSource =
  backend.data.resources.graphqlApi.addHttpDataSource(
    'KnowledgeBaseDataSource',
    `https://bedrock-agent-runtime.${cdk.Stack.of(backend.data).region}.amazonaws.com`,
    {
      authorizationConfig: {
        signingRegion: cdk.Stack.of(backend.data).region,
        signingServiceName: 'bedrock',
      },
    },
  );

// Grant the data source permission to call the Bedrock Retrieve API
knowledgeBaseDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      `arn:aws:bedrock:us-east-1:${cdk.Stack.of(backend.data).account}:knowledge-base/YXEDJZHW60`,
    ],
    actions: ['bedrock:Retrieve'],
  }),
);
