import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index'

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    return <Button>Button</Button>
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <Button size='sm'>Small</Button>
        <Button size='md'>Medium</Button>
        <Button size='lg'>Large</Button>
      </div>
    )
  },
}

export const Colors: Story = {
  render: function ColorsStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <Button>Default (accent)</Button>
        <Button backgroundColor='var(--warning-color)' hoverBackgroundColor='#992208'>
          Warning
        </Button>
        <Button backgroundColor='var(--error-color)' hoverBackgroundColor='#a00945'>
          Danger
        </Button>
        <Button backgroundColor='#2e7d32' hoverBackgroundColor='#1b5e20'>
          Custom fill
        </Button>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: function DisabledStory() {
    return <Button disabled>Disabled</Button>
  },
}
