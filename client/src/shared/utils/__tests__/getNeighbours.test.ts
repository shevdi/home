import { getNeighbours } from '../getNeighbours'

describe('getNeighbours', () => {
  const getKey = (item: { id: number }) => item.id

  it('returns [undefined, undefined] when arr is undefined', () => {
    expect(getNeighbours(undefined, 1, getKey)).toEqual([undefined, undefined])
  })

  it('returns [undefined, undefined] when arr is empty', () => {
    expect(getNeighbours([], 1, getKey)).toEqual([undefined, undefined])
  })

  it('returns [undefined, undefined] when value is undefined', () => {
    expect(getNeighbours([{ id: 1 }], undefined, getKey)).toEqual([undefined, undefined])
  })

  it('returns [undefined, undefined] when value is not found', () => {
    const arr = [{ id: 1 }, { id: 2 }]
    expect(getNeighbours(arr, 99, getKey)).toEqual([undefined, undefined])
  })

  it('returns [undefined, next] when value is at first index', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(getNeighbours(arr, 1, getKey)).toEqual([undefined, { id: 2 }])
  })

  it('returns [prev, undefined] when value is at last index', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(getNeighbours(arr, 3, getKey)).toEqual([{ id: 2 }, undefined])
  })

  it('returns [prev, next] when value is in the middle', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(getNeighbours(arr, 2, getKey)).toEqual([{ id: 1 }, { id: 3 }])
  })

  it('returns [undefined, undefined] when array has single matching element', () => {
    const arr = [{ id: 1 }]
    expect(getNeighbours(arr, 1, getKey)).toEqual([undefined, undefined])
  })

  it('works with different key extractors', () => {
    const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    const getName = (item: { id: number; name: string }) => item.name
    expect(getNeighbours(arr, 'b', getName)).toEqual([{ id: 1, name: 'a' }, undefined])
  })
})
