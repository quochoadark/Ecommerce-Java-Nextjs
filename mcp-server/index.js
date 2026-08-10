const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require('fs').promises;
const path = require('path');

// Khởi tạo MCP Server
const server = new McpServer({
  name: "Webbanhang1 Context Server",
  version: "1.0.0"
});

const DOCS_DIR = path.resolve(__dirname, '../docs/ai_context');
const BACKEND_DIR = path.resolve(__dirname, '../backend/backend-ecommerce');
const FRONTEND_DIR = path.resolve(__dirname, '../front-end/front-end-ecommerce');

// --- TÀI NGUYÊN (RESOURCES) ---

// Tài nguyên chính dùng để định tuyến ngữ cảnh (Context Router)
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
          text: `Lỗi khi đọc file định tuyến ngữ cảnh: ${error.message}`
        }]
      };
    }
  }
);

// --- CÔNG CỤ (TOOLS) ---

// Công cụ: read_context_file (Đọc file tài liệu ngữ cảnh)
server.tool(
  "read_context_file",
  "Đọc một file ngữ cảnh AI cụ thể từ thư mục docs/ai_context",
  {
    filePath: z.string().describe("Đường dẫn tương đối đến file ngữ cảnh (ví dụ: 'shared/architect.md', 'backend/backend_rules.md')")
  },
  async ({ filePath }) => {
    try {
      const fullPath = path.join(DOCS_DIR, filePath);
      
      // Kiểm tra bảo mật cơ bản để đảm bảo không đọc file ngoài thư mục DOCS_DIR
      if (!fullPath.startsWith(DOCS_DIR)) {
        return {
          content: [{ type: "text", text: `Lỗi: Từ chối truy cập. Đường dẫn ${filePath} nằm ngoài thư mục ngữ cảnh cho phép.` }]
        };
      }
      
      const content = await fs.readFile(fullPath, 'utf8');
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Lỗi khi đọc file ${filePath}: ${error.message}` }]
      };
    }
  }
);

// Công cụ: list_backend_structure (Xem cấu trúc thư mục backend)
server.tool(
  "list_backend_structure",
  "Xem cấu trúc thư mục của dự án backend để hiểu các module hiện có",
  {
    targetDir: z.string().optional().describe("Thư mục con tùy chọn bên trong backend/backend-ecommerce/src/main/java/com/ecommerce/backend_ecommerce. Dùng '.' cho thư mục gốc.")
  },
  async ({ targetDir }) => {
    try {
      const baseJavaDir = path.join(BACKEND_DIR, 'src/main/java/com/ecommerce/backend_ecommerce');
      const searchDir = targetDir && targetDir !== '.' ? path.join(baseJavaDir, targetDir) : baseJavaDir;
      
      if (!searchDir.startsWith(baseJavaDir)) {
         return {
          content: [{ type: "text", text: `Lỗi: Từ chối truy cập. Đường dẫn nằm ngoài thư mục Java của backend.` }]
        };
      }
      
      const entries = await fs.readdir(searchDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => `[THƯ MỤC]  ${e.name}`);
      const files = entries.filter(e => !e.isDirectory()).map(e => `[TẬP TIN] ${e.name}`);
      
      return {
        content: [{ type: "text", text: `Thư mục: ${targetDir || '.'}\n\n${[...dirs, ...files].join('\n')}` }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Lỗi khi quét cấu trúc backend: ${error.message}\nHãy đảm bảo thư mục này tồn tại.` }]
      };
    }
  }
);

// Công cụ: list_frontend_structure (Xem cấu trúc thư mục frontend Next.js)
server.tool(
  "list_frontend_structure",
  "Xem cấu trúc thư mục của dự án frontend Next.js",
  {
    targetDir: z.string().optional().describe("Thư mục con tùy chọn bên trong front-end/front-end-ecommerce/src. Dùng '.' cho thư mục gốc.")
  },
  async ({ targetDir }) => {
    try {
      const baseSrcDir = path.join(FRONTEND_DIR, 'src');
      const searchDir = targetDir && targetDir !== '.' ? path.join(baseSrcDir, targetDir) : baseSrcDir;
      
      if (!searchDir.startsWith(baseSrcDir)) {
         return {
          content: [{ type: "text", text: `Lỗi: Từ chối truy cập. Đường dẫn nằm ngoài thư mục src của frontend.` }]
        };
      }
      
      const entries = await fs.readdir(searchDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => `[THƯ MỤC]  ${e.name}`);
      const files = entries.filter(e => !e.isDirectory()).map(e => `[TẬP TIN] ${e.name}`);
      
      return {
        content: [{ type: "text", text: `Thư mục: ${targetDir || '.'}\n\n${[...dirs, ...files].join('\n')}` }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Lỗi khi quét cấu trúc frontend: ${error.message}\nHãy đảm bảo thư mục này tồn tại.` }]
      };
    }
  }
);

// Khởi chạy server sử dụng phương thức truyền thông stdio (Standard Input/Output)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Webbanhang1 MCP Server đang chạy thông qua stdio");
}

main().catch((error) => {
  console.error("Lỗi Server:", error);
  process.exit(1);
});
