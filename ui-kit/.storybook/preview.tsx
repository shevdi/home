import type { Preview } from '@storybook/react'
import React, { useEffect } from 'react'
import '../src/styles/tokens.css'
import '../src/styles/base.css'

/** Headless Radix primitives + CSS modules do not require `@radix-ui/themes` Theme provider. */
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Document theme (html[data-theme])',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || 'light'
      useEffect(() => {
        document.documentElement.dataset.theme = theme
      }, [theme])
      return (
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
