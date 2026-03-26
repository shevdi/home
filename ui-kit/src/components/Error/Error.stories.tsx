import type { Meta, StoryObj } from '@storybook/react'
import { Error } from './index'

const meta: Meta = {
  title: 'Components/Error',
  component: Error,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    return <Error title="Something went wrong" message="We could not complete the request. Try again in a moment." />
  },
}

export const WithRetry: Story = {
  render: function WithRetryStory() {
    return (
      <Error
        title="Network error"
        message="Check your connection."
        onRetry={() => {
          // eslint-disable-next-line no-console
          console.log('retry')
        }}
      />
    )
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        <Error size="sm" title="Small" message="Compact error panel." />
        <Error size="md" title="Medium" message="Default error panel." />
        <Error size="lg" title="Large" message="Spacious error panel." />
      </div>
    )
  },
}
