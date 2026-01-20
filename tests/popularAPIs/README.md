# Popular API Specs

MarkdownAPI specifications for well-known APIs. Proves the format scales to real-world complexity.

## Target APIs

- **GitHub** - Repos, issues, PRs, actions, webhooks
- **Google Cloud Billing** - Billing accounts, budgets, cost management
- **Notion** - Pages, databases, blocks, search
- **Anthropic** - Messages, streaming, tool use

## Purpose

1. Demonstrate MarkdownAPI handles production-grade APIs
2. Provide test fixtures for benchmarks
3. Serve as reference examples for spec authors

## Testing Notes

This section documents issues discovered during spec creation that are relevant to benchmarking.

### Anthropic

**Issue:** The community-maintained OpenAPI spec (`openapi.yaml`) is severely outdated—it only documents the legacy `/v1/complete` endpoint with deprecated models (claude-v1, claude-instant-v1). The current Messages API (`/v1/messages`) is not present.

**Resolution:** The MAPI spec (`anthropic.mapi.md`) was written from scratch using current Anthropic documentation, covering the modern Messages API with tool use, streaming, and current models.

**Benchmark implication:** This is actually a valid test case—it demonstrates that OpenAPI specs in the wild are often stale, while MAPI's prose-first approach may encourage more frequent updates since the documentation IS the spec.
