# ESLint + TypeScript for Backend Packages

## ADDED Requirements

### Requirement: Server has ESLint and TypeScript linting

The server package SHALL have an ESLint configuration that lints TypeScript files using typescript-eslint recommended rules.

#### Scenario: Lint script runs

- **WHEN** `npm run lint` is executed in the server directory
- **THEN** ESLint runs on server source files and reports issues

#### Scenario: TypeScript-aware rules

- **WHEN** ESLint runs on server
- **THEN** typescript-eslint parser and recommended rules are applied

### Requirement: Mock-server has ESLint and TypeScript linting

The mock-server package SHALL have an ESLint configuration that lints TypeScript files.

#### Scenario: Lint script runs

- **WHEN** `npm run lint` is executed in the mock-server directory
- **THEN** ESLint runs on mock-server source files and reports issues

### Requirement: E2E has ESLint and TypeScript linting

The e2e package SHALL have an ESLint configuration and TypeScript configuration (tsconfig.json) that enable linting of test files.

#### Scenario: Lint script runs

- **WHEN** `npm run lint` is executed in the e2e directory
- **THEN** ESLint runs on e2e test files and reports issues

#### Scenario: TypeScript compiles e2e

- **WHEN** TypeScript checks e2e
- **THEN** a tsconfig.json exists and e2e .ts files are included
