import axios from 'axios';
import { JWT } from 'next-auth/jwt';
import qs from 'qs';

interface AccessToken {
  token_type: string;
  scope: string;
  expires_in: string;
  ext_expires_in: string;
  expires_on: string;
  not_before: string;
  resource: string;
  access_token: string;
  refresh_token: string;
}

export const isTokenValid = (expiryDate: Date) => {
  const now = new Date();

  return now < expiryDate;
};

export const refreshAccessToken = async (token: JWT) => {
  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    console.log(token);

    const body = qs.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.AZURE_AD_CLIENT_ID,
      client_secret: process.env.AZURE_AD_CLIENT_SECRET,
      scope: process.env.AZURE_AD_SCOPE,
      refresh_token: token.refreshToken,
    });

    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/token`,
      body,
      {
        headers: headers,
      }
    );

    const data: AccessToken = await response.data;
    console.log('WE ARE HERE');
    console.log('SUCCESSFULLY UPDATED DATA????!??!!');
    console.log('Is old access token equal to new token?', token.accessToken === data.access_token);

    // Update the token with the new access token
    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken, // Use the new refresh token if it's available, else default to old one
      accessTokenExpiresAt: new Date(parseInt(data.expires_on) * 1000),
    };
  } catch (error) {
    console.error(error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};
