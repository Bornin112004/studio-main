# Testing Report

Date: 2025-11-06

## Summary

- Test runner: Vitest v1.6.1
- Command executed: `npm test -- --run`
- Result: PASS
- Files: 5 passed (5)
- Tests: 11 passed (11)
- Duration: ~2.1s (transform ~1.9s)

## What was validated

- Sheet mapping logic
  - `mapSheetValuesToKpis` parses rows, handles optional/JSON fields (TrendData, Comments), merges defaults, and groups by department.
  - Edge cases covered: invalid/missing JSON is tolerated; synthesized trend data is used when needed.
- API route handlers
  - `GET /api/google-sheets`: validates query params; enforces auth; forwards Google API errors; returns values array on success.
  - `GET /api/auth/callback/google`: handles error callback; handles missing `code`; exchanges `code` for tokens; returns success HTML.
- End-to-end integration
  - Google Sheets values -> KPI mapping flow: mocked cookies + Google API returns 2 data rows; pipeline maps to KPIs and groups by department correctly.

## How tests are structured

- Unit tests
  - `test/utils.test.ts`: className merge helper.
  - `test/mapper.test.ts`: core mapping with JSON parsing and by-department assignment.
- API tests
  - `test/api/google-sheets.test.ts`: route behavior for missing params, missing auth, upstream error, and success.
  - `test/api/auth-callback-google.test.ts`: callback behavior for error, missing code, successful token exchange, failed exchange.
- Integration test
  - `test/integration/sheets-to-kpis.test.ts`: uses the API response to feed the mapper and asserts final structures.

## Test doubles and environment notes

- `global.fetch` is mocked per-test for upstream Google calls.
- `next/headers` is mocked to emulate cookie presence/absence and to capture cookie writes when relevant.
- Path alias `@` is resolved via `vitest.config.ts` to `./src`.
- Platform: Windows; Node/npm via project defaults. Tests run in Vitest "node" environment.

## Running locally

```bash
npm test -- --run
```

Optional focused run for a single file:

```bash
npx vitest run test/api/google-sheets.test.ts
```

## Next steps (optional)

- Add negative tests for malformed rows (e.g., missing ID/Department).
- Add snapshot tests for `generateReportPDF` output.
- Consider adding a CI workflow to run `npm run typecheck && npm test -- --run` on pushes/PRs.
