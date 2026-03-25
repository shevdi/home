import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { TextDecoder, TextEncoder } from 'node:util'

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder
}

if (!global.fetch) {
  global.fetch = jest.fn()
}

if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

afterEach(cleanup)
