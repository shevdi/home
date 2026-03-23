import type { Preview } from '@storybook/react'
import React, { useEffect } from 'react'
import '../src/styles/tokens.css'

const preview: Preview = {
  decorators: [
    (Story) => {
      useEffect(() => {
        document.documentElement.dataset.theme = 'light'
      }, [])
      return (
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
