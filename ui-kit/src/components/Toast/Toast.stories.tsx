import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../Button'
import { Toast } from './index'
import type { ToastRootProps } from './index'

const meta: Meta = {
  title: 'Components/Toast',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 'min(100vh, 480px)', width: '100%', boxSizing: 'border-box' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

function ToastDemo({ variant }: { variant: ToastRootProps['variant'] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Toast.Provider label="Уведомления" duration={4000} swipeDirection="right">
      {/* Viewport must mount before Toast.Root so Radix has a portal target (refs run after paint). */}
      <Toast.Viewport />
      <div style={{ padding: '2rem' }}>
        <Button type="button" onClick={() => setOpen(true)}>
          Показать уведомление
        </Button>
      </div>
      <Toast.Root open={open} onOpenChange={setOpen} variant={variant}>
        <Toast.Title>Сохранено</Toast.Title>
        <Toast.Description>Изменения применены.</Toast.Description>
        <Toast.Close />
      </Toast.Root>
    </Toast.Provider>
  )
}

export const Default: Story = {
  render: function DefaultStory() {
    return <ToastDemo variant="default" />
  },
}

export const Success: Story = {
  render: function SuccessStory() {
    return <ToastDemo variant="success" />
  },
}

export const Error: Story = {
  render: function ErrorStory() {
    return <ToastDemo variant="error" />
  },
}

export const Warning: Story = {
  render: function WarningStory() {
    return <ToastDemo variant="warning" />
  },
}

export const WithAction: Story = {
  render: function WithActionStory() {
    const [open, setOpen] = React.useState(false)

    return (
      <Toast.Provider label="Уведомления" duration={8000}>
        <Toast.Viewport />
        <div style={{ padding: '2rem' }}>
          <Button type="button" onClick={() => setOpen(true)}>
            Удалить с подтверждением
          </Button>
        </div>
        <Toast.Root open={open} onOpenChange={setOpen} variant="warning">
          <Toast.Title>Удалить элемент?</Toast.Title>
          <Toast.Description>Это действие нельзя отменить.</Toast.Description>
          <Toast.Action altText="Подтвердить удаление">Удалить</Toast.Action>
          <Toast.Close />
        </Toast.Root>
      </Toast.Provider>
    )
  },
}
