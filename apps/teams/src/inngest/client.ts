import { EventSchemas, Inngest } from 'inngest';
import { z } from 'zod';
import { rateLimitMiddleware } from './middlewares/rate-limit-middleware';
import { unauthorizedMiddleware } from './middlewares/unauthorized-middleware';

export type FunctionHandler = Parameters<typeof inngest.createFunction>[2];

// access_token: access_token,
// refresh_token: refresh_token,

export const inngest = new Inngest({
  id: 'github',
  schemas: new EventSchemas().fromZod({
    'users/page_sync.requested': {
      data: z.object({
        organisationId: z.string().uuid(),
        access_token: z.string(),
        refresh_token: z.string(),
        isFirstSync: z.boolean().default(false),
        syncStartedAt: z.number(),
        cursor: z.string().nullable(),
      }),
    },
    'third-party-apps/page_sync.requested': {
      data: z.object({
        organisationId: z.string().uuid(),
        access_token: z.string(),
        refresh_token: z.string(),
        isFirstSync: z.boolean().default(false),
        syncStartedAt: z.number(),
        cursor: z.string().nullable(),
      }),
    },
  }),
  // middleware: [rateLimitMiddleware, unauthorizedMiddleware],
});
