const { nanoid } = require('nanoid');

module.exports = {
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US',
  },
  generateBuildId: async () => {
    const id = nanoid();
    process.env.BUILD_ID = id;
    return id;
  },
};
