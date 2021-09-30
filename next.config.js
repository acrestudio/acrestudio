const { nanoid } = require('nanoid');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  experimental: {
    staticPageGenerationTimeout: 60 * 10,
  },
  generateBuildId: async () => {
    const id = nanoid();
    process.env.BUILD_ID = id;
    return id;
  },
});
