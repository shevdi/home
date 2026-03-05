# Shared Types Package

## ADDED Requirements

### Requirement: ILocation.nominatim supports address structure for reverse geocoding

The shared package SHALL define `ILocation.nominatim` such that it MAY include an optional `address` field of type `Record<string, string | undefined>`. This structure SHALL allow consumers (e.g. `getLocationParts`) to access `location.nominatim?.address` without type assertions.

#### Scenario: getLocationParts uses nominatim without assertion

- **WHEN** `getLocationParts` receives an `ILocation` with `nominatim.address` populated
- **THEN** the function accesses `nominatim.address` and extracts city/country without using `as` type assertions

#### Scenario: Backward compatibility with existing data

- **WHEN** `ILocation` has `nominatim` as a plain object or without `address`
- **THEN** TypeScript still accepts the value and consumers can safely check `nominatim?.address` before use
