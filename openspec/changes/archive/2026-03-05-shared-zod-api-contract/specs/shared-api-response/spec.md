# Shared ApiResponse Type

## ADDED Requirements

### Requirement: ApiResponse generic type in shared

The shared package SHALL export `ApiResponse<T>` with `success: boolean`, optional `data?: T`, optional `error?: string`, optional `message?: string`. This type SHALL be used for typed API responses and error handling.

#### Scenario: Client uses ApiResponse for error handling

- **WHEN** client receives an API response or error object
- **THEN** it can narrow or type-check using `ApiResponse` without assertion

#### Scenario: Server response shape matches ApiResponse

- **WHEN** server returns JSON with success, data, error, or message fields
- **THEN** the shape satisfies `ApiResponse<T>` for appropriate T
