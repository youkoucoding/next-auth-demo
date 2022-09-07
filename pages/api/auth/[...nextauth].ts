import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

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
          scope: `openid profile email ${oauthScope}`,
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
});
