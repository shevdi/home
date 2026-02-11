import { describe, it, expect } from '@jest/globals'
import { normalizeTags } from '../normalizeTags.js'

describe('normalizeTags', () => {
  describe('to undefined', () => {
    it('returns undefined for undefined', () => {
      expect(normalizeTags(undefined)).toBeUndefined()
    })

    it('returns undefined for null', () => {
      expect(normalizeTags(null)).toBeUndefined()
    })

    it('returns undefined for number', () => {
      expect(normalizeTags(42)).toBeUndefined()
    })

    it('returns undefined for object', () => {
      expect(normalizeTags({ foo: 'bar' })).toBeUndefined()
    })

    it('returns undefined for boolean', () => {
      expect(normalizeTags(true)).toBeUndefined()
    })
  })

  describe('array input', () => {
    it('maps and trims array of strings', () => {
      expect(normalizeTags(['tag1', ' tag2 ', 'tag3'])).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('converts non-string elements to strings', () => {
      expect(normalizeTags([1, 2, true])).toEqual(['1', '2', 'true'])
    })

    it('filters out empty strings after trim', () => {
      expect(normalizeTags(['a', '', '  ', 'b'])).toEqual(['a', 'b'])
    })

    it('returns empty array for empty array', () => {
      expect(normalizeTags([])).toEqual([])
    })
  })

  describe('string input', () => {
    it('returns [] for empty string', () => {
      expect(normalizeTags('')).toEqual([])
    })

    it('returns [] for whitespace-only string', () => {
      expect(normalizeTags('   ')).toEqual([])
    })

    it('splits comma-separated tags', () => {
      expect(normalizeTags('tag1,tag2,tag3')).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('trims commas and spaces around tags', () => {
      expect(normalizeTags(' tag1 , tag2 , tag3 ')).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('parses valid JSON array string', () => {
      expect(normalizeTags('["tag1","tag2","tag 3"]')).toEqual(['tag1', 'tag2', 'tag 3'])
    })

    it('parses JSON array with extra spaces and trims', () => {
      expect(normalizeTags('[" tag1 ", " tag2 "]')).toEqual(['tag1', 'tag2'])
    })

    it('falls back to comma split when JSON is invalid', () => {
      expect(normalizeTags('tag1,tag2')).toEqual(['tag1', 'tag2'])
    })

    it('falls back to comma split when JSON is not an array', () => {
      expect(normalizeTags('{"tags":["a"]}')).toEqual(['{"tags":["a"]}'])
    })

    it('falls back to comma split on JSON parse error', () => {
      expect(normalizeTags('not valid json')).toEqual(['not valid json'])
    })

    it('handles single tag', () => {
      expect(normalizeTags('solo')).toEqual(['solo'])
    })

    describe('exotic string cases', () => {
      it('handles unicode and emoji in comma-separated tags', () => {
        expect(normalizeTags('café,日本語,🎉')).toEqual(['café', '日本語', '🎉'])
      })

      it('handles tabs and newlines around tags', () => {
        expect(normalizeTags('a\t,\t\nb\n,\tc')).toEqual(['a', 'b', 'c'])
      })

      it('handles JSON array with unicode and emoji', () => {
        expect(normalizeTags('["café","日本語","🎉"]')).toEqual(['café', '日本語', '🎉'])
      })

      it('handles tag with comma inside JSON array', () => {
        expect(normalizeTags('["foo, bar","baz"]')).toEqual(['foo, bar', 'baz'])
      })
    })
  })
})
