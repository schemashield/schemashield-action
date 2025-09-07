# SchemaShield GitHub Action

CI guard for Schema drift using [SchemaShield](https://schemashield.ai). Validates prompts against JSON Schemas using the hosted `/v1/ci/run` endpoint.

## Usage

```yaml
- uses: jtc268/schemashield-action@v1
  with:
    token: ${{ secrets.SS_TOKEN }}
    provider: openai
    model: gpt-4.1-mini
    schemas: ./schemas
    prompts: ./prompts
    seeds: 3
    mode: validate
```

- `token`: Project API key (ssk_...). Create in the SchemaShield dashboard.
- `schemas`: Directory with JSON Schema files (`.json`).
- `prompts`: Directory with plain-text prompt files. Files are matched to schemas by base filename.
- `mode`: `validate` (fast) or `repair` (attempt repair).

## Notes
- This action calls your SchemaShield account via HTTPS; quotas and CI enforcement are handled server-side.
- Provider API keys are not required in CI since generation happens server-side.
