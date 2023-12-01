import { z } from 'zod';

export const slackMemberSchema = z.object({
  id: z.string().min(1),
  real_name: z.string().min(1),
  profile: z.object({
    email: z.string().min(1),
  }),
});
