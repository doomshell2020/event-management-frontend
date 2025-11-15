import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from "next/head"; // Import Head
import Contentlayout from '@/shared/layout-components/layout/content-layout';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { Provider } from 'react-redux';
import store from '@/shared/redux/store/store';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast
import NextNProgress from 'nextjs-progressbar';
import nprogress from 'nprogress'; // Import nprogress
import '@/styles/globals.scss';
import 'nprogress/nprogress.css'; // Import nprogress CSS

const layouts = {
  Contentlayout: Contentlayout
};

function MyApp({ Component, pageProps }) {
  // const Layout = layouts[Component.layout] || ((pageProps) => <Component>{pageProps}</Component>);
  const Layout = layouts[Component.layout] || (({ children }) => <>{children}</>);

  const router = useRouter();
  let SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const isProduction = process.env.NODE_ENV == "production";

  useEffect(() => {
    const handleStart = () => nprogress.start();
    const handleStop = () => nprogress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  // useEffect(() => {
  //   if (typeof window == 'undefined') {
  //     const startCronBackup = require('@/utils/cronBackup');
  //     startCronBackup();
  //   }
  // }, []);


  return (
    <>
      <Head>
        <title>eboxtickets</title>
        <meta property="og:title" content="eboxtickets" />
        <meta property="og:description" content="eboxtickets is a ticket management platform that provides event management solutions. Anyone can post their event, integrate event APIs on their platform, and easily handle ticket management." />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        {!isProduction && <meta name="robots" content="noindex, nofollow" />}
      </Head>
      <Provider store={store}>
        <NextNProgress
          color={`#e62d56`}
          startPosition={0.3}
          stopDelayMs={200}
          height={3} // Corrected height prop
          showOnShallow={true}
          options={{ showSpinner: false }} // ✅ Disable spinner here
        />
        <Layout>
          {/* <SSRProvider> */}
            <Component {...pageProps} />
          {/* </SSRProvider> */}
        </Layout>
        <Toaster position="buttom-right" />
      </Provider>
    </>
  );
}

export default MyApp;
