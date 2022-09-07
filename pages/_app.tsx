import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import * as React from 'react';

type AuthProps = {
  children: React.ReactNode;
};

function Auth({ children }: AuthProps): JSX.Element {
  const { data: session, status } = useSession();

  const loading = status === 'loading';
  const isLogin = !!session?.user;

  React.useEffect(() => {
    if (loading) return;
    if (!isLogin) signIn();
  }, [isLogin, loading]);

  if (isLogin) {
    return <>{children}</>;
  }

  return <>loading</>;
}

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Auth>
        <Component {...pageProps} />
      </Auth>
    </SessionProvider>
  );
}
