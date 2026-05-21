import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 storage for:
 * - User-uploaded pin images
 * - DAR manuals/PDFs are in the external bucket "pins1776"
 *   (Bedrock Knowledge Base points there directly)
 */
export const storage = defineStorage({
  name: 'darPinStorage',
  access: (allow) => ({
    'pin-images/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
