import { Toast } from '@shevdi-home/ui-kit'
import { useEffect, useRef, useState } from 'react'
import { useIsOnline } from '@/shared/hooks'
import { pwaNetworkMessages, pwaPhotoMessages } from '@/shared/pwa/messages'

function NetworkToastRoots() {
  const online = useIsOnline()
  const prevOnlineRef = useRef<boolean | null>(null)
  const [reconnectOpen, setReconnectOpen] = useState(false)

  useEffect(() => {
    const prev = prevOnlineRef.current
    if (online === false || (prev === false && online === true)) {
      setReconnectOpen(true)
    }
    prevOnlineRef.current = online
  }, [online])

  return (
    <>
      <Toast.Root open={!online} duration={Infinity} variant='warning'>
        <Toast.Title>{pwaPhotoMessages.offlineNoInternet}</Toast.Title>
      </Toast.Root>
      <Toast.Root open={reconnectOpen} onOpenChange={setReconnectOpen} duration={10_000} variant='success'>
        <Toast.Title>{pwaNetworkMessages.connectionRestored}</Toast.Title>
      </Toast.Root>
    </>
  )
}

/** App shell: offline warning (no close) + success on reconnection (10 s). */
export function NetworkToastProvider({ children }: React.PropsWithChildren) {
  return (
    <Toast.Provider label='Уведомления' swipeDirection='right'>
      <Toast.Viewport />
      <NetworkToastRoots />
      {children}
    </Toast.Provider>
  )
}
