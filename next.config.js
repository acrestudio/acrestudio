const { nanoid } = require('nanoid');

module.exports = {
  generateBuildId: async () => {
    const id = nanoid();
    process.env.BUILD_ID = id;
    return id;
  },
};
