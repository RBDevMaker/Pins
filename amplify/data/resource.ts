import { defineData } from '@aws-amplify/backend';

/**
 * Data schema for pin rules and user layouts.
 * This will be backed by DynamoDB via AppSync.
 */
const schema = /* GraphQL */ `
  type PinRule @model @auth(rules: [{ allow: public, operations: [read] }]) {
    id: ID!
    name: String!
    category: String!
    widthInches: Float!
    heightInches: Float!
    allowedRows: [Int!]!
    allowedSide: String!
    requiredSpacingInches: Float!
    canStack: Boolean!
    manualCitation: String!
  }

  type SavedLayout @model @auth(rules: [{ allow: owner }]) {
    id: ID!
    name: String!
    rowCount: Int!
    ribbonLengthInches: Float!
    ribbonWidthInches: Float!
    pinIds: [String!]!
  }
`;

export const data = defineData({ schema });
