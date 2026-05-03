# Token Optimization Protocol

## Model Selection Logic

- **Haiku**: Use for repetitive tasks, boilerplate, or simple file reading.
- **Sonnet**: Use for feature implementation, debugging, and general research.
- **Opus**: Use ONLY for complex architectural decisions or solving "impossible" bugs.

## Tooling Preferences

1. **Web**: Always use `WebFetch` for text-based public info. Avoid screenshot-based browsing unless auth is required.
2. **PDFs**: Use `pdftotext` instead of the internal vision/read tools.
3. **Sub-agents**:
   - Max spawn depth: 2.
   - Haiku sub-agents cannot spawn further agents.
   - If a task exceeds a model's capability, return to parent for re-assignment.
