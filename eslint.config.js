import antfu from '@antfu/eslint-config'

// TODO: add eslint-plugin-tailwindcss after the issue is resolved
// https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/335
// https://github.com/francoismassart/eslint-plugin-tailwindcss/pull/330

export default antfu({
  ignores: [
    'dist',
    '**/dist/**',
    'node_modules',
    '**/node_modules/**',
    'public',
    '**/public/**',
    'src/styles/presets/**',
  ],
}, {
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'prefer-regex-literals': 'off',
    'ts/ban-ts-comment': 'off',
    'vue/custom-event-name-casing': 'off',
  },
})
