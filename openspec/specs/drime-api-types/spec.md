# Drime API Types

## ADDED Requirements

### Requirement: Drime API responses are properly typed

The Drime API response interfaces SHALL NOT use `any` for response fields. Unknown or undocumented fields SHALL use `unknown` or be omitted.

#### Scenario: DrimeTokenApiResponse has no any

- **WHEN** `DrimeTokenApiResponse` is used
- **THEN** `data` and `request` (if present) are typed as `unknown` or a concrete type, not `any`

#### Scenario: Type safety in Drime service

- **WHEN** the Drime service consumes token or file entry responses
- **THEN** type assertions or narrowings are explicit; no implicit `any` propagation
