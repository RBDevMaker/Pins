import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Data schema for pin rules, user layouts, and Bedrock KB query.
 */
const schema = a.schema({
  // --- Bedrock Knowledge Base query ---
  knowledgeBase: a
    .query()
    .arguments({ input: a.string() })
    .handler(
      a.handler.custom({
        dataSource: 'KnowledgeBaseDataSource',
        entry: './resolvers/kbResolver.js',
      }),
    )
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()]),

  // --- Pin rules model ---
  PinRule: a
    .model({
      name: a.string().required(),
      category: a.string().required(),
      widthInches: a.float().required(),
      heightInches: a.float().required(),
      allowedRows: a.integer().array().required(),
      allowedSide: a.string().required(),
      requiredSpacingInches: a.float().required(),
      canStack: a.boolean().required(),
      manualCitation: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // --- Saved layouts model ---
  SavedLayout: a
    .model({
      name: a.string().required(),
      rowCount: a.integer().required(),
      ribbonLengthInches: a.float().required(),
      ribbonWidthInches: a.float().required(),
      pinIds: a.string().array().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });
