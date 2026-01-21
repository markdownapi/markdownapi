# Markdown API (MAPI)

**API specifications for the AI era** — human-readable, LLM-optimized, and built for how APIs actually work today.

> **Technology Preview**: MAPI is not production-ready. We're actively testing, iterating, and building in public. See our [exploratory findings](https://markdownapi.org/findings.html) for current test results.

## What is MAPI?

MAPI is a Markdown-based format for describing APIs. Instead of wrestling with walls of YAML or JSON Schema, you write specs that read like documentation — because they are documentation.

MAPI is designed for:
- **Humans** — Markdown is already how developers write docs
- **LLMs** — Structured sections, clear intentions, explicit constraints
- **Tooling** — Convert to/from OpenAPI, validate, generate clients

## Key Ideas

- **Capability-oriented** — Organize by what your API does, not what URLs it exposes
- **Unified format** — REST, WebSocket, SSE, webhooks in one spec
- **Progressive disclosure** — Load only what you need via [MAPI Skills](https://markdownapi.org/skills.html)
- **LLM-native** — Intentions explain *when* to use capabilities, not just *how*

## Quick Links

| Resource | Description |
|----------|-------------|
| [Website](https://markdownapi.org) | Overview and guides |
| [Full Specification](https://markdownapi.org/specs/mapi-specification-v0.94.html) | The complete MAPI spec |
| [Skills](https://markdownapi.org/skills.html) | Progressive loading format for agents |
| [Findings](https://markdownapi.org/findings.html) | E2E test results (OpenAPI vs MAPI vs Skills) |
| [Get Involved](https://markdownapi.org/get-involved.html) | How to contribute |

## Repository Structure

```
/
├── website/                 # Marketing site (markdownapi.org)
│   ├── index.html
│   ├── specs/               # Specification documents
│   └── guides/              # Conversion guides
├── cli/                     # MAPI CLI tool
├── lib/
│   └── mapi-converter/      # OpenAPI → MAPI/Skill converter
├── tests/
│   ├── harness/             # E2E test runner
│   └── popularAPIs/         # Test specs for Anthropic, GitHub, GCP
└── skills/                  # Reference Skills
```

## Try It

Convert an OpenAPI spec to MAPI Skill format:

```bash
# Clone and install
git clone https://github.com/markdownapi/markdownapi.git
cd markdownapi/cli
npm install
npm run build

# Convert an OpenAPI spec
node dist/index.js convert path/to/openapi.yaml -o ./output
```

## Get Involved

MAPI is being built in public. We need help with:

- **Reference Skills** for popular APIs (Stripe, Twilio, Slack, etc.)
- **VS Code extension** for syntax highlighting and validation
- **Skill loader library** for agent frameworks
- **Registry support** from aggregators like Smithery, Glama
- **Feedback** on the spec and Skills format

See the [Get Involved](https://markdownapi.org/get-involved.html) page for details.

## Related Projects

- [Agents.md](https://agents-md.org) — Conventions for agent-friendly documentation
- [AgentSkills.io](https://agentskills.io) — Skill format for AI agents
- [Model Context Protocol](https://modelcontextprotocol.io) — Runtime protocol for LLM tool use

## License

MIT

## Contact

- GitHub: [@markdownapi](https://github.com/markdownapi)
- Email: jeffrschneider@gmail.com
- LinkedIn: [schneiderjeff](https://linkedin.com/in/schneiderjeff)
- Twitter: [@jeffrschneider](https://x.com/jeffrschneider)
