import config from '@commitlint/config-conventional';
config.rules['type-enum'][2].push('bump');
config.prompt.questions.type.enum['bump'] = {
  description: 'A version bump (major, minor, patch)',
  title: 'Version Bump',
  emoji: '🔼',
};

export default config;
