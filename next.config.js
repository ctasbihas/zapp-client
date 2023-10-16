/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID: 735238761,
    NEXT_PUBLIC_ZEGO_SERVER_SECRET: "3c376a3ea627ac6d9a4f6de3ebfeb608"
  },
  images: {
    domains: ["lh3.googleusercontent.com", "localhost"],
  },
};

module.exports = nextConfig;
