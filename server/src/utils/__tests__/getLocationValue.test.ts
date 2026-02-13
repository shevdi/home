import { describe, it, expect } from '@jest/globals'
import { getLocationValue } from '../getLocationValue'
import type { ReverseGeocodeResponse } from '../../services/nominatim'
import type { DaDataGeolocateResponse } from '../../services/dadata'

describe('getLocationValue', () => {
  it('returns empty arrays when both sources are null', () => {
    const result = getLocationValue([null, null])
    expect(result).toEqual({ country: [], city: [] })
  })

  it('returns empty arrays when both sources are undefined', () => {
    const result = getLocationValue([undefined, undefined])
    expect(result).toEqual({ country: [], city: [] })
  })

  it('extracts country and city from Nominatim', () => {
    const nominatim: ReverseGeocodeResponse = {
      address: {
        country: 'Russia',
        city: 'Tomsk',
      },
    }
    const result = getLocationValue([nominatim, null])
    expect(result.country).toEqual(['Russia'])
    expect(result.city).toEqual(['Tomsk'])
  })

  it('extracts country and city from DaData', () => {
    const dadata: DaDataGeolocateResponse = {
      suggestions: [
        {
          value: 'г Томск, Россия',
          unrestricted_value: 'г Томск, Россия',
          data: {
            country: 'Россия',
            city: 'Томск',
          },
        },
      ],
    }
    const result = getLocationValue([null, dadata])
    expect(result.country).toEqual(['Россия'])
    expect(result.city).toEqual(['Томск'])
  })

  it('merges unique values from both sources and orders Russian first, then English', () => {
    const nominatim: ReverseGeocodeResponse = {
      address: {
        country: 'Russia',
        city: 'Tomsk',
      },
    }
    const dadata: DaDataGeolocateResponse = {
      suggestions: [
        {
          value: 'г Томск, Россия',
          unrestricted_value: 'г Томск, Россия',
          data: {
            country: 'Россия',
            city: 'Томск',
          },
        },
      ],
    }
    const result = getLocationValue([nominatim, dadata])
    expect(result.country).toEqual(['Россия', 'Russia'])
    expect(result.city).toEqual(['Томск', 'Tomsk'])
  })

  it('deduplicates identical values', () => {
    const nominatim: ReverseGeocodeResponse = {
      address: {
        country: 'Russia',
        city: 'Moscow',
      },
    }
    const dadata: DaDataGeolocateResponse = {
      suggestions: [
        {
          value: 'г Москва',
          unrestricted_value: 'г Москва',
          data: {
            country: 'Russia',
            city: 'Moscow',
          },
        },
      ],
    }
    const result = getLocationValue([nominatim, dadata])
    expect(result.country).toEqual(['Russia'])
    expect(result.city).toEqual(['Moscow'])
  })

  it('extracts city from Nominatim town/village when city is absent', () => {
    const nominatim: ReverseGeocodeResponse = {
      address: {
        country: 'Russia',
        town: 'Small Town',
        village: 'Village',
      },
    }
    const result = getLocationValue([nominatim, null])
    expect(result.country).toEqual(['Russia'])
    expect(result.city).toContain('Small Town')
    expect(result.city).toContain('Village')
  })

  it('extracts city from DaData settlement when city is absent', () => {
    const dadata: DaDataGeolocateResponse = {
      suggestions: [
        {
          value: 'поселок',
          unrestricted_value: 'поселок',
          data: {
            country: 'Россия',
            settlement: 'Поселок',
          },
        },
      ],
    }
    const result = getLocationValue([null, dadata])
    expect(result.country).toEqual(['Россия'])
    expect(result.city).toEqual(['Поселок'])
  })
})
