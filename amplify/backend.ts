import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * Amplify Gen 2 backend definition.
 * Add auth when ready: import { auth } from './auth/resource';
 */
defineBackend({
  data,
  storage,
});
