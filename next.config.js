const { nanoid } = require('nanoid');

module.exports = {
  experimental: {
    staticPageGenerationTimeout: 60 * 30,
  },
  generateBuildId: async () => {
    const id = nanoid();
    process.env.BUILD_ID = id;
    return id;
  },
};
