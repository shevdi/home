# shared-nominatim-types Specification

## Purpose
TBD - created by archiving change shared-zod-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Nominatim API types in shared

The shared package SHALL export types for the Nominatim reverse geocode API: `NominatimAddress` (address object shape) and `NominatimReverseResponse` (full response with place_id, display_name, address, etc.). These types SHALL align with the Nominatim API JSON structure.

#### Scenario: Server nominatim service uses shared types

- **WHEN** server's `nominatimReverseGeocode` returns data
- **THEN** the return type uses `NominatimReverseResponse` from shared

#### Scenario: Client useReverseGeocode uses shared types

- **WHEN** client fetches from Nominatim API and parses JSON
- **THEN** the parsed data is typed with `NominatimReverseResponse` or `NominatimAddress` from shared

#### Scenario: Address fields accessible without assertion

- **WHEN** consumer accesses `response.address.country` or `response.address.city`
- **THEN** TypeScript accepts the access without `as` assertion

