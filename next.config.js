/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = {
  webpack(config) {
    config.module.rules.push({
      include: /node_modules/,
      test: /\.mjs$/,
      type: 'javascript/auto'
    });
    config.module.rules.push({
      test: /\.svg$/,
      issuer: { and: [/\.(js|ts)x?$/] },      
      use: ['@svgr/webpack'],
    });

    config.module.rules.push({
      loader: 'babel-loader', 
      test: /@?(node-gyp-build).*\.(ts|js)x?$/,
      options: {
        presets: ['@babel/preset-env']
      }
    })   
    return config;
  },
  resolve: {
    fallback: {
        net: false
    }
  },
};
