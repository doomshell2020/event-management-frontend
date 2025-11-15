// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // console.log('>>>>>>>>');
  
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Fallback favicon — what Google Search sees */}
        <link rel="icon" href="/favicon.png?v=2" />

        {/* Color scheme specific favicons (for browser only, not Googlebot) */}
        <link
          rel="icon"
          href="/favicon.png?v=2"
          media="(prefers-color-scheme: light)"
        />

        <link
          rel="icon"
          href="/favicon.png?v=2"
          media="(prefers-color-scheme: dark)"
        />

        <link rel="icon" type="image/png" sizes="192x192" href="/favicon.png?v=2" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png?v=2" />
        <link rel="apple-touch-icon" href="/favicon.png?v=2" sizes="180x180" />

        {/* Theme color */}
        <meta name="theme-color" content="#a1032eff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
