# @deepracticex/service-example

**Deepractice Service Development Standards Example**

This service serves as the standard example for all Deepractice services. It demonstrates best practices for Express-based microservice development.

## Features

- Express.js server with TypeScript
- Health check endpoint
- API routing structure
- Environment variable configuration
- Hot reload development mode

## Quick Start

### Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing the Service

```bash
# Health check
curl http://localhost:3000/health

# API endpoint
curl http://localhost:3000/api
```

## Directory Structure

```
services/service-example/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # Express server setup
│   ├── routes/               # API routes
│   │   └── index.ts
│   ├── middleware/           # Custom middleware
│   └── controllers/          # Route controllers
├── dist/                     # Build output
├── .env.example              # Environment template
├── tsconfig.json             # TypeScript config
├── tsup.config.ts            # Build config
└── package.json              # Package manifest
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Health Check

```
GET /health
```

Returns service health status.

### API Root

```
GET /api
```

Example API endpoint.

## Development Guidelines

### Adding Routes

1. Create route file in `src/routes/`
2. Define routes using Express Router
3. Import and mount in `src/routes/index.ts`

### Adding Middleware

1. Create middleware in `src/middleware/`
2. Apply in `src/server.ts`

### Adding Controllers

1. Create controller in `src/controllers/`
2. Use in route handlers

## Best Practices

- Use TypeScript for type safety
- Implement proper error handling
- Add logging for debugging
- Follow REST API conventions
- Document all endpoints

---

_Last updated: 2025-10-10_
