# SchemaShield GitHub Action

Prevent LLM output drift in your CI/CD pipeline. [SchemaShield](https://schemashield.ai) validates that your prompts consistently return structured outputs matching your JSON schemas.

## Why SchemaShield?

When building with LLMs, small prompt changes can break your structured outputs. SchemaShield catches these issues before they reach production by:

- **Automated Schema Validation**: Test prompts against JSON schemas in every PR
- **Multi-Seed Testing**: Run multiple variations to catch inconsistent outputs
- **Zero Infrastructure**: No need to manage API keys or LLM calls in CI
- **Fast Feedback**: Get validation results in seconds

## Quick Start

**1. Get your API key** from [schemashield.ai](https://schemashield.ai) and add it to your repository secrets as `SCHEMASHIELD_TOKEN`

**2. Add to your workflow:**

```yaml
name: Validate LLM Outputs
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: jtc268/schemashield-action@v1
        with:
          token: ${{ secrets.SCHEMASHIELD_TOKEN }}
          provider: openai
          model: gpt-4o-mini
          schemas: ./schemas
          prompts: ./prompts
          seeds: 3
          mode: validate
```

**3. Organize your files:**

```
your-repo/
├── schemas/
│   ├── user-profile.json
│   └── product-list.json
└── prompts/
    ├── user-profile.txt
    └── product-list.txt
```

Prompts are automatically matched to schemas by filename.

## Configuration

### Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `token` | SchemaShield API key (starts with `ssk_`) | `${{ secrets.SCHEMASHIELD_TOKEN }}` |
| `provider` | LLM provider | `openai`, `anthropic` |
| `model` | Model name to test | `gpt-4o-mini`, `claude-3-5-sonnet` |
| `schemas` | Path to JSON schema directory | `./schemas` |
| `prompts` | Path to prompt files directory | `./prompts` |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `seeds` | Number of test variations per prompt (higher = more thorough) | `1` |
| `mode` | `validate` (fast check) or `repair` (attempt fixes) | `validate` |
| `api_url` | Custom API endpoint (advanced) | `https://schemashield.ai` |

## How It Works

1. **File Matching**: Prompts are paired with schemas by filename (`user-profile.txt` → `user-profile.json`)
2. **Server-Side Execution**: SchemaShield runs your prompts through the specified LLM
3. **Schema Validation**: Outputs are validated against your JSON schemas
4. **Results**: Action fails if any output doesn't match its schema

**No LLM API keys needed in CI** – all generation happens server-side through your SchemaShield account.

## Common Use Cases

- Validate prompt changes in PRs before merging
- Catch prompt engineering regressions
- Test structured data extraction pipelines
- Ensure JSON API response formats
- Validate function calling schemas

## Troubleshooting

**Action fails with "Invalid token"**
→ Verify your `SCHEMASHIELD_TOKEN` secret is set correctly and starts with `ssk_`

**Schema validation failures**
→ Use `mode: repair` to see suggested fixes, then update your prompts or schemas

**Need more thorough testing?**
→ Increase `seeds` to 5-10 for more comprehensive validation

## Learn More

- [Documentation](https://schemashield.ai/docs)
- [Get API Key](https://schemashield.ai)
- [Report Issues](https://github.com/jtc268/schemashield-action/issues)
