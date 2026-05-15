const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require('fs').promises;
const path = require('path');

// Initialize the MCP Server
const server = new McpServer({
  name: "Webbanhang1 Context Server",
  version: "1.0.0"
});

const DOCS_DIR = path.resolve(__dirname, '../docs/ai_context');
const BACKEND_DIR = path.resolve(__dirname, '../backend/backend-ecommerce');
const FRONTEND_DIR = path.resolve(__dirname, '../front-end/front-end-ecommerce');

// --- RESOURCES ---

// Root Context Router Resource
server.resource(
  "context-router",
  new z.ZodString(),
  async (uri) => {
    try {
      const routerPath = path.join(DOCS_DIR, '00-router.md');
      const content = await fs.readFile(routerPath, 'utf8');
      return {
        contents: [{
          uri: uri.href,
          text: content
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error reading context router: ${error.message}`
        }]
      };
    }
  }
);

// --- TOOLS ---

// Tool: read_context_file
server.tool(
  "read_context_file",
  "Read a specific AI context file from docs/ai_context directory",
  {
    filePath: z.string().describe("Relative path to the context file (e.g., 'shared/architect.md', 'backend/backend_rules.md')")
  },
  async ({ filePath }) => {
    try {
      const fullPath = path.join(DOCS_DIR, filePath);
      
      // Basic security check to ensure we don't read outside DOCS_DIR
      if (!fullPath.startsWith(DOCS_DIR)) {
        return {
          content: [{ type: "text", text: `Error: Access denied. Path ${filePath} is outside the context directory.` }]
        };
      }
      
      const content = await fs.readFile(fullPath, 'utf8');
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error reading file ${filePath}: ${error.message}` }]
      };
    }
  }
);

// Tool: list_backend_structure
server.tool(
  "list_backend_structure",
  "List the directory structure of the backend project to understand available modules",
  {
    targetDir: z.string().optional().describe("Optional subdirectory inside backend/backend-ecommerce/src/main/java/com/ecommerce/backend_ecommerce. Use '.' for root.")
  },
  async ({ targetDir }) => {
    try {
      const baseJavaDir = path.join(BACKEND_DIR, 'src/main/java/com/ecommerce/backend_ecommerce');
      const searchDir = targetDir && targetDir !== '.' ? path.join(baseJavaDir, targetDir) : baseJavaDir;
      
      if (!searchDir.startsWith(baseJavaDir)) {
         return {
          content: [{ type: "text", text: `Error: Access denied. Path is outside the backend Java directory.` }]
        };
      }
      
      const entries = await fs.readdir(searchDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => `[DIR]  ${e.name}`);
      const files = entries.filter(e => !e.isDirectory()).map(e => `[FILE] ${e.name}`);
      
      return {
        content: [{ type: "text", text: `Directory: ${targetDir || '.'}\n\n${[...dirs, ...files].join('\n')}` }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error listing backend structure: ${error.message}\nMake sure the directory exists.` }]
      };
    }
  }
);

// Tool: list_frontend_structure
server.tool(
  "list_frontend_structure",
  "List the directory structure of the frontend Next.js project",
  {
    targetDir: z.string().optional().describe("Optional subdirectory inside front-end/front-end-ecommerce/src. Use '.' for root.")
  },
  async ({ targetDir }) => {
    try {
      const baseSrcDir = path.join(FRONTEND_DIR, 'src');
      const searchDir = targetDir && targetDir !== '.' ? path.join(baseSrcDir, targetDir) : baseSrcDir;
      
      if (!searchDir.startsWith(baseSrcDir)) {
         return {
          content: [{ type: "text", text: `Error: Access denied. Path is outside the frontend src directory.` }]
        };
      }
      
      const entries = await fs.readdir(searchDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => `[DIR]  ${e.name}`);
      const files = entries.filter(e => !e.isDirectory()).map(e => `[FILE] ${e.name}`);
      
      return {
        content: [{ type: "text", text: `Directory: ${targetDir || '.'}\n\n${[...dirs, ...files].join('\n')}` }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error listing frontend structure: ${error.message}\nMake sure the directory exists.` }]
      };
    }
  }
);

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Webbanhang1 MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
