import type { Meta, StoryObj } from '@storybook/react'
import { Error } from './Error'

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
