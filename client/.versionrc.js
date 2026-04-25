const internalSection = `Internals`;

module.exports = {
  types: [
    { type: 'feat', section: 'Features', hidden: false },
    { type: 'fix', section: 'Bug Fixes', hidden: false },
    { type: 'docs', section: 'Documentation', hidden: false },
    { type: 'perf', section: 'Performance Updates', hidden: false },

    { type: 'chore', section: internalSection, hidden: false },

    { type: 'test', section: internalSection, hidden: false },

    { type: 'ci', section: internalSection, hidden: false },

    { type: 'refactor', section: internalSection, hidden: false },

    { type: 'style', section: internalSection, hidden: false },
  ],
  skip: {
    changelog: true,
  },
  commitAll: true,
};
