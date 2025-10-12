# @deepracticex/logger

Universal logging system for all JavaScript runtimes - Node.js, Cloudflare Workers, Browser, and more.

## Features

- 🌍 **Universal** - Works in Node.js, Cloudflare Workers, Browser, and other JavaScript runtimes
- 🎯 **Platform-Specific Optimizations** - Pino for Node.js, lightweight console for edge/browser
- 📦 **Tree-Shakeable** - Only bundles the code you need for your platform
- 🎨 **Pretty Console Output** - Color support with automatic MCP stdio detection
- 📁 **File Logging** - Daily rotation for Node.js (when enabled)
- 📍 **Caller Location Tracking** - Automatic file/line tracking
- 🔧 **TypeScript Support** - Full type safety
- ⚡ **Zero Config** - Sensible defaults, customizable when needed

## Installation

```bash
pnpm add @deepracticex/logger
```

## Platform-Specific Entry Points

Choose the right entry point for your platform:

### Node.js (Default)

```typescript
// Uses Pino for high performance logging
import { createLogger } from "@deepracticex/logger";
// or explicitly
import { createLogger } from "@deepracticex/logger/nodejs";

const logger = createLogger({
  level: "info",
  name: "my-service",
  console: true,
  file: true, // File logging with daily rotation
});

logger.info("Server started");
```

### Cloudflare Workers

```typescript
// Uses lightweight console adapter (no Node.js dependencies)
import { createLogger } from "@deepracticex/logger/cloudflare-workers";

const logger = createLogger({
  level: "info",
  name: "my-worker",
  console: true,
});

logger.info("Request handled");
```

### Browser

```typescript
// Uses browser-optimized console adapter
import { createLogger } from "@deepracticex/logger/browser";

const logger = createLogger({
  level: "debug",
  name: "my-app",
  console: true,
  colors: true,
});

logger.info("App initialized");
```

## Quick Start

### Default Logger (Node.js)

```typescript
import { info, warn, error, debug } from "@deepracticex/logger";

info("Server started");
warn("Low memory");
error("Connection failed");
debug("Debug info");
```

### Custom Logger

```typescript
import { createLogger } from "@deepracticex/logger";

const logger = createLogger({
  level: "debug",
  name: "@deepracticex/my-service",
  console: true,
  file: {
    dirname: "/var/log/myapp",
  },
  colors: true,
});

logger.info("Custom logger initialized");
```

## Configuration

### LoggerConfig

```typescript
interface LoggerConfig {
  // Log level (default: 'info')
  level?: "fatal" | "error" | "warn" | "info" | "debug" | "trace";

  // Package/service name (default: 'app')
  name?: string;

  // Console output (default: true)
  console?: boolean;

  // File logging - Node.js only (default: false)
  file?:
    | boolean
    | {
        dirname?: string; // Log directory (default: ~/.deepractice/logs)
      };

  // Color support (default: true, auto-disabled in MCP stdio)
  colors?: boolean;
}
```

### Environment Variables

- `LOG_LEVEL` - Set log level (default: 'info')
- `MCP_TRANSPORT=stdio` - Auto-disable colors for MCP stdio mode
- `DEEPRACTICE_NO_WORKERS=true` - Force sync mode (useful for Electron)

## Log Levels

- `fatal` - Critical errors that require immediate attention
- `error` - Errors that need to be fixed
- `warn` - Warnings about potential issues
- `info` - General information (default)
- `debug` - Detailed debug information
- `trace` - Very verbose trace information

## Platform Details

### Node.js

Uses [Pino](https://github.com/pinojs/pino) for high-performance logging:

- File logging with daily rotation
- Automatic caller location tracking
- Worker threads for better performance
- MCP stdio mode detection

**File Structure:**

```
~/.deepractice/logs/
├── deepractice-2025-10-13.log       # All logs
└── deepractice-error-2025-10-13.log # Error logs only
```

### Cloudflare Workers

Uses lightweight console adapter:

- Minimal bundle size (~1.5KB)
- No Node.js dependencies
- Full logging API compatibility
- Works with Wrangler dev and production

### Browser

Uses browser-optimized console adapter:

- Native console API
- Color support
- Source map integration
- DevTools friendly

## Examples

### Node.js Service

```typescript
import { createLogger } from "@deepracticex/logger";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  name: "@deepracticex/api-server",
  console: true,
  file: {
    dirname: "./logs",
  },
});

logger.info({ port: 3000 }, "Server started");
logger.error({ err: error }, "Database connection failed");
```

### Cloudflare Worker

```typescript
import { createLogger } from "@deepracticex/logger/cloudflare-workers";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const logger = createLogger({
      name: "my-worker",
      level: env.LOG_LEVEL || "info",
    });

    logger.info({ url: request.url }, "Request received");

    try {
      // Handle request
      return new Response("OK");
    } catch (error) {
      logger.error({ error }, "Request failed");
      return new Response("Error", { status: 500 });
    }
  },
};
```

### Browser App

```typescript
import { createLogger } from "@deepracticex/logger/browser";

const logger = createLogger({
  name: "my-app",
  level: "debug",
  colors: true,
});

logger.info("App initialized");

document.addEventListener("click", (e) => {
  logger.debug({ target: e.target }, "User clicked");
});
```

## Architecture

The logger uses a two-adapter architecture:

1. **Pino Adapter** - For Node.js (high performance, file support)
2. **Console Adapter** - For edge/browser (lightweight, universal)

Platform-specific entry points ensure only the necessary adapter is bundled:

```
@deepracticex/logger          → nodejs.ts → pino-adapter
@deepracticex/logger/nodejs   → nodejs.ts → pino-adapter
@deepracticex/logger/cloudflare-workers → cloudflare-workers.ts → console-adapter
@deepracticex/logger/browser  → browser.ts → console-adapter
```

## Bundle Size

- Node.js: Full pino functionality (~200KB with dependencies)
- Cloudflare Workers: ~1.5KB (console adapter only)
- Browser: ~1.5KB (console adapter only)

## FAQ

### Why platform-specific entry points?

This allows bundlers (esbuild, webpack, etc.) to tree-shake unused code. If you use the Cloudflare Workers entry, the 200KB+ pino dependency won't be included in your bundle.

### Can I use the same logger across different files?

Yes! Create a logger module:

```typescript
// src/infrastructure/logger/index.ts
import { createLogger } from "@deepracticex/logger/cloudflare-workers";

export const logger = createLogger({
  name: "my-app",
  level: "info",
});
```

Then import everywhere:

```typescript
import { logger } from "~/infrastructure/logger";

logger.info("Hello from any file!");
```

### Does it work with monorepos?

Yes! Each package can use the appropriate entry point:

```typescript
// apps/api (Node.js)
import { createLogger } from "@deepracticex/logger";

// apps/worker (Cloudflare)
import { createLogger } from "@deepracticex/logger/cloudflare-workers";

// apps/web (Browser)
import { createLogger } from "@deepracticex/logger/browser";
```

## License

MIT
