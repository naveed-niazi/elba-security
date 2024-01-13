import { env } from '@/env';

type TokenResponseData = { access_token: string; refresh_token: string };
type TokenData = { accessToken: string; refreshToken: string };

export const getTokens = async (code: string): Promise<TokenData> => {
  const requestBody = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: env.AZURE_AD_CLIENT_ID,
    client_secret: env.AZURE_AD_CLIENT_SECRET,
    redirect_uri: env.AZURE_AUTH_REDIRECT_URL,
  });

  const response = await fetch(env.AZURE_TOKENS_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: requestBody.toString(),
  });

  const result = (await response.json()) as TokenResponseData;

  return { accessToken: result.access_token, refreshToken: result.refresh_token };
};
