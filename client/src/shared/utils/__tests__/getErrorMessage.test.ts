import { getErrorMessage } from '../getErrorMessage'

describe('getErrorMessage', () => {
  it('returns message from Error instance', () => {
    expect(getErrorMessage(new Error('Something went wrong'))).toBe('Something went wrong')
  })

  it('returns default message for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('Неизвестная ошибка')
  })

  it('returns default message for null', () => {
    expect(getErrorMessage(null)).toBe('Неизвестная ошибка')
  })

  it('returns message from object with message property', () => {
    expect(getErrorMessage({ message: 'Custom error' })).toBe('Custom error')
  })

  it('returns message from object with data.message', () => {
    expect(getErrorMessage({ data: { message: 'Nested error' } })).toBe('Nested error')
  })

  it('returns string when error is a string', () => {
    expect(getErrorMessage('Direct string error')).toBe('Direct string error')
  })

  it('returns default message when object has data but no message in data', () => {
    expect(getErrorMessage({ data: { code: 500 } })).toBe('Неизвестная ошибка')
  })

  it('returns default message when object has empty data object', () => {
    expect(getErrorMessage({ data: {} })).toBe('Неизвестная ошибка')
  })

  it('returns default message for number', () => {
    expect(getErrorMessage(42)).toBe('Неизвестная ошибка')
  })

  it('returns default message for boolean', () => {
    expect(getErrorMessage(true)).toBe('Неизвестная ошибка')
  })

  it('prefers message over data.message when both exist (non-RTK shape)', () => {
    expect(getErrorMessage({ message: 'Top level', data: { message: 'Nested' } })).toBe('Top level')
  })

  it('prefers data.message for RTK fetchBaseQuery HTTP errors when both exist', () => {
    expect(
      getErrorMessage({
        status: 401,
        data: { message: 'Неверный логин или пароль' },
        message: 'Rejected',
      }),
    ).toBe('Неверный логин или пароль')
  })
})
