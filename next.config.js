const ENV = process.env.NODE_ENV;
const isDev = ENV == 'development';
const isPWAEnabled = false; // toggle this via .env

console.log(
  '===========Running in',
  ENV,
  'Mode | PWA Enabled:',
  isPWAEnabled,
  ' | DB_NAME:',
  process.env.DB_NAME,
  '==================='
);

const withPWA = isPWAEnabled
  ? require('next-pwa')({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: false,
    })
  : (config) => config;

const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['ondalinda.s3.amazonaws.com'],
  },
  env: {
    APP_ENV: process.env.NODE_ENV,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    HOST: process.env.HOST,
    LIVE_DB_NAME: process.env.LIVE_DB_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SITE_URL: process.env.SITE_URL,
    STRIPE_SECRET_KEY_DONATION: process.env.STRIPE_SECRET_KEY_DONATION,
    STRIPE_PUBLIC_KEY_DONATION: process.env.STRIPE_PUBLIC_KEY_DONATION,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_DEV_SECRET_KEY: process.env.STRIPE_DEV_SECRET_KEY,
    STRIPE_DEV_PUBLIC_KEY: process.env.STRIPE_DEV_PUBLIC_KEY,
    STRIPE_DEV_WEBHOOK_SECRET: process.env.STRIPE_DEV_WEBHOOK_SECRET,
    TICKET_BOOK_URL: process.env.TICKET_BOOK_URL,
    DATA_ENCODE_SECRET_KEY: process.env.DATA_ENCODE_SECRET_KEY,
    STRIPE_TESTING_KEY: process.env.STRIPE_TESTING_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // ✅ NEW AWS ENV VARS
    NEXT_PUBLIC_S3_URL: process.env.NEXT_PUBLIC_S3_URL, // exposed to client
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  },

  // ✅ Add CORS headers here
  async headers() {
    return [
      {
        // Apply to all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, // Or set to specific domain: "https://ondalinda.com"
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-api-key" },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
