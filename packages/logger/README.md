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

### Test Environment (Vitest/Jest)

```typescript
// Uses in-memory test adapter with log capture
import {
  createLogger,
  getTestLogs,
  clearTestLogs,
} from "@deepracticex/logger/test";

const logger = createLogger({
  level: "debug",
  name: "my-service",
  console: false, // Silent by default in tests
});

// Your test code
logger.info("test message");

// Assert logs were captured
const logs = getTestLogs();
expect(logs).toHaveLength(1);
expect(logs[0].message).toBe("test message");

// Clean up between tests
clearTestLogs();
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

### Test Environment

Uses in-memory test adapter:

- Auto-detected in vitest/jest (via `VITEST=true` or `NODE_ENV=test`)
- Silent by default (no console output)
- Captures all logs in memory for assertions
- Zero I/O overhead for fast tests
- Utilities: `getTestLogs()`, `clearTestLogs()`, `getTestLogsByLevel()`

**Usage in tests:**

```typescript
import {
  createLogger,
  getTestLogs,
  clearTestLogs,
} from "@deepracticex/logger/test";

describe("my feature", () => {
  const logger = createLogger();

  afterEach(() => {
    clearTestLogs(); // Clean up between tests
  });

  it("should log messages", () => {
    logger.info("test started");
    logger.warn("warning message");

    const logs = getTestLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].level).toBe("info");
  });
});
```

**Auto-detection:**

When running in vitest, the default `@deepracticex/logger` import automatically uses the test adapter:

```typescript
// Automatically uses test adapter in vitest
import { createLogger } from "@deepracticex/logger";

const logger = createLogger(); // No console output in tests
```

**Enable console output for debugging:**

```typescript
// Show logs in test output
const logger = createLogger({ console: true });

// Or run with verbose reporter
// pnpm test -- --reporter=verbose
```

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

The logger uses a multi-adapter architecture with automatic runtime detection:

1. **Pino Adapter** - For Node.js (high performance, file support)
2. **Console Adapter** - For edge/browser (lightweight, universal)
3. **Test Adapter** - For test environments (in-memory, inspectable)

Platform-specific entry points ensure only the necessary adapter is bundled:

```
@deepracticex/logger          → Auto-detect → appropriate adapter
@deepracticex/logger/nodejs   → nodejs.ts → pino-adapter
@deepracticex/logger/cloudflare-workers → cloudflare-workers.ts → console-adapter
@deepracticex/logger/browser  → browser.ts → console-adapter
@deepracticex/logger/test     → test.ts → test-adapter
```

**Auto-detection priority:**

1. Test environment (VITEST=true or NODE_ENV=test) → test adapter
2. Cloudflare Workers (caches API present) → console adapter
3. Node.js (process.versions.node) → pino adapter
4. Fallback → console adapter (browser)

## Bundle Size

- Node.js: Full pino functionality (~200KB with dependencies)
- Cloudflare Workers: ~1.5KB (console adapter only)
- Browser: ~1.5KB (console adapter only)
- Test: ~2KB (test adapter with inspection utilities)

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

### How do I use it in tests?

The logger automatically detects test environments (vitest/jest) and uses the test adapter:

```typescript
// Automatically silent in tests
import { createLogger } from "@deepracticex/logger";
const logger = createLogger();

logger.info("message"); // Captured, but no console output
```

To inspect logs in tests:

```typescript
import {
  createLogger,
  getTestLogs,
  clearTestLogs,
} from "@deepracticex/logger/test";

const logger = createLogger();
logger.info("test message");

const logs = getTestLogs();
expect(logs[0].message).toBe("test message");

clearTestLogs(); // Clean up
```

### How do I see logs when debugging tests?

Use vitest's verbose reporter:

```bash
pnpm test -- --reporter=verbose
```

Or enable console output explicitly:

```typescript
const logger = createLogger({ console: true });
```

## License

MIT
