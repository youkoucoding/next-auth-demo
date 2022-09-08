import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { isTokenValid, refreshAccessToken } from '../../../utils/accessToken';

const clientId = process.env.AZURE_CLIENT_ID!;
const clientSecret = process.env.AZURE_CLIENT_SECRET!;
const tenantId = process.env.AZURE_TENANT_ID!;
const oauthScope = process.env.AZURE_OAUTH_SCOPE!;

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    AzureADProvider({
      clientId,
      clientSecret,
      tenantId,
      authorization: {
        params: {
          scope: `openid profile email ${oauthScope} offline_access`,
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
  callbacks: {
    //@ts-ignore
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpiresAt: account.expires_at && new Date(account.expires_at * 1000),
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (isTokenValid(new Date(token.accessTokenExpiresAt! as string))) {
        console.log('Access token is still valid. Returning previous token.');
        return token;
      }

      // Refresh the access token
      console.log('Access token has expired, refreshing');
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = token;
      session.accessToken = token.accessToken;
      session.accessTokenExpiresAt = token.accessTokenExpiresAt;
      session.error = token.error;

      return session;
    },
  },
});
