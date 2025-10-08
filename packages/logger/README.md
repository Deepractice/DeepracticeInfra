# @deepracticex/logger

Unified logging system for Deepractice projects using [Pino](https://github.com/pinojs/pino).

## Features

- 🎨 Console output with pretty print
- 📁 File logging with daily rotation
- 📍 Automatic caller location tracking
- 🎯 Configurable log levels
- 🌈 Color support (respects MCP stdio mode)
- ⚡ Electron compatibility (sync mode)
- 🔧 TypeScript support

## Installation

```bash
pnpm add @deepracticex/logger
```

## Usage

### Basic Usage

```typescript
import { info, warn, error, debug } from '@deepracticex/logger'

info('Server started')
warn('Low memory')
error('Connection failed')
debug('Debug info')
```

### Custom Logger Instance

```typescript
import { createLogger } from '@deepracticex/logger'

const logger = createLogger({
  level: 'debug',
  name: '@deepracticex/account-service',
  console: true,
  file: {
    dirname: '/var/log/myapp',
  },
  colors: true,
})

logger.info('Custom logger initialized')
```

## Configuration

### LoggerConfig

```typescript
interface LoggerConfig {
  level?: string // 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
  console?: boolean // Enable console output (default: true)
  file?:
    | boolean
    | {
        dirname?: string // Log directory (default: ~/.deepractice/logs)
      }
  colors?: boolean // Enable colors (default: true, auto-disabled in MCP stdio)
  name?: string // Package/service name (default: 'app')
}
```

### Environment Variables

- `LOG_LEVEL` - Set log level (default: 'info')
- `MCP_TRANSPORT=stdio` - Auto-disable colors for MCP stdio mode
- `DEEPRACTICE_NO_WORKERS=true` - Force sync mode (useful for Electron)

## Log Levels

- `fatal` - Critical errors
- `error` - Errors
- `warn` - Warnings
- `info` - General information
- `debug` - Debug information
- `trace` - Verbose trace

## File Logging

Logs are automatically rotated daily:

```
~/.deepractice/logs/
├── deepractice-2025-10-08.log       # All logs
└── deepractice-error-2025-10-08.log # Error logs only
```

## Caller Location

Automatically tracks and displays file location:

```
[2025-10-08 10:30:00] INFO: @deepracticex/account-service [index.ts:42] Server started
```

## MCP Compatibility

When running in MCP stdio mode (`MCP_TRANSPORT=stdio`), colors are automatically disabled to prevent ANSI escape codes from interfering with JSON-RPC messages.

## Electron Compatibility

When running in Electron or when `DEEPRACTICE_NO_WORKERS=true` is set, the logger uses sync mode to avoid worker thread issues.

## License

MIT
