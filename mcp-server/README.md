# Webbanhang1 MCP Server

This directory contains the Model Context Protocol (MCP) server for the Webbanhang1 project.

It provides AI assistants with automated tools to:
1. Load global and specific project context/rules from `docs/ai_context`.
2. Inspect the backend (Java/Spring Boot) directory structure.
3. Inspect the frontend (Next.js) directory structure.

## Setup

1. Ensure Node.js is installed.
2. Run `npm install` inside the `mcp-server` directory.

## Configuration

To use this with Claude for Desktop or other MCP-compatible clients, add the configuration from `mcp.json` (in the project root) to your client's MCP settings file (e.g., `claude_desktop_config.json`).

```json
{
  "mcpServers": {
    "webbanhang1-context": {
      "command": "node",
      "args": ["/absolute/path/to/Webbanhang1 AI agent/mcp-server/index.js"]
    }
  }
}
```

## Available Tools

- `read_context_file(filePath)`: Reads a specific markdown context file.
- `list_backend_structure(targetDir)`: Lists directories and files in the Spring Boot `src` folder.
- `list_frontend_structure(targetDir)`: Lists directories and files in the Next.js `src` folder.

## Available Resources

- `context-router`: Returns the content of `00-router.md` as the main entry point for AI context routing.
