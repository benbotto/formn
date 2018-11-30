module.exports = {
  out: './doc',
  exclude: [
    '**/test/**/*',
    '**/*.spec.ts',
    '"**/*.entity.ts"'
  ],
  mode: 'file',
  excludePrivate: true,
  excludeNotExported: true,
  excludeExternals: true,
  target: 'ES6',
};

