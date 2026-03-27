import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
    // Docker / --host 0.0.0.0 — must be boolean `true` (not the string 'all'); otherwise Storybook calls .join() and crashes
    allowedHosts: true,
  },
}

export default config
