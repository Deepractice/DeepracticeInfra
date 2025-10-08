# @deepracticex/error-handling

Unified error handling system for Deepractice projects with type-safe error classes and framework integrations.

## Features

- 🎯 **Type-safe error classes** - Structured errors with proper typing
- 🌐 **HTTP errors** - Common HTTP status code errors (400, 401, 403, 404, etc.)
- 💼 **Business errors** - Domain-specific error types
- 🏭 **Error factory** - Convenient error creation API
- 🔌 **Framework middleware** - Express and Hono support
- 🔄 **Result type** - Optional functional error handling pattern
- 📊 **Serialization** - JSON-serializable error objects for APIs
- 📍 **Stack traces** - Proper stack trace preservation

## Installation

```bash
pnpm add @deepracticex/error-handling
```

## Quick Start

### Basic Usage

```typescript
import { errors } from "@deepracticex/error-handling";

// Throw errors using the factory
if (!user) {
  throw errors.notFound("User", userId);
}

if (age < 18) {
  throw errors.validation("Age must be at least 18", { age: "too young" });
}

// Or use error classes directly
import { NotFoundError, ValidationError } from "@deepracticex/error-handling";

throw new NotFoundError("User", userId);
throw new ValidationError("Invalid email", { email: "must be valid email" });
```

### With Express

```typescript
import express from "express";
import {
  createExpressErrorHandler,
  errors,
} from "@deepracticex/error-handling";
import { error as logError } from "@deepracticex/logger";

const app = express();

// Your routes
app.get("/users/:id", async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    throw errors.notFound("User", req.params.id);
  }
  res.json(user);
});

// Error handler (must be last)
app.use(
  createExpressErrorHandler({
    logger: logError,
    includeStack: process.env.NODE_ENV === "development",
  }),
);
```

### With Hono

```typescript
import { Hono } from "hono";
import { createHonoErrorHandler, errors } from "@deepracticex/error-handling";
import { error as logError } from "@deepracticex/logger";

const app = new Hono();

// Your routes
app.get("/users/:id", async (c) => {
  const user = await db.user.findUnique({ where: { id: c.req.param("id") } });
  if (!user) {
    throw errors.notFound("User", c.req.param("id"));
  }
  return c.json(user);
});

// Error handler
app.onError(
  createHonoErrorHandler({
    logger: logError,
    includeStack: process.env.NODE_ENV === "development",
  }),
);
```

### Result Pattern (Functional Approach)

```typescript
import { ok, err, type Result } from "@deepracticex/error-handling";
import type { AppError } from "@deepracticex/error-handling";

async function getUser(id: string): Promise<Result<User, AppError>> {
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return err(errors.notFound("User", id));
    }
    return ok(user);
  } catch (e) {
    return err(errors.internal("Database query failed", e));
  }
}

// Usage
const result = await getUser("123");
if (result.ok) {
  console.log("User:", result.value.name);
} else {
  console.error("Error:", result.error.message);
}
```

## Error Types

### HTTP Errors

| Error                      | Status Code | Usage                                   |
| -------------------------- | ----------- | --------------------------------------- |
| `ValidationError`          | 400         | Invalid input data                      |
| `UnauthorizedError`        | 401         | Authentication required                 |
| `ForbiddenError`           | 403         | Insufficient permissions                |
| `NotFoundError`            | 404         | Resource not found                      |
| `ConflictError`            | 409         | Resource conflict                       |
| `UnprocessableEntityError` | 422         | Valid syntax but semantically incorrect |
| `RateLimitError`           | 429         | Too many requests                       |
| `InternalError`            | 500         | Server error                            |
| `ServiceUnavailableError`  | 503         | Service temporarily unavailable         |

### Business Errors

| Error                  | Status Code | Usage                            |
| ---------------------- | ----------- | -------------------------------- |
| `DatabaseError`        | 500         | Database operation failures      |
| `ExternalServiceError` | 502         | External API/service failures    |
| `ConfigurationError`   | 500         | Missing or invalid configuration |
| `BusinessRuleError`    | 422         | Business logic violations        |

## Error Factory API

```typescript
import { errors } from '@deepracticex/error-handling'

// Validation error
errors.validation(message, fields?)

// Authentication/Authorization
errors.unauthorized(message?)
errors.forbidden(message?)

// Resource errors
errors.notFound(resource, identifier?)
errors.conflict(message, meta?)
errors.unprocessable(message, meta?)

// Rate limiting
errors.rateLimit(message?, retryAfter?)

// Server errors
errors.internal(message, originalError?)
errors.unavailable(message?, retryAfter?)

// Business errors
errors.database(message, operation?, originalError?)
errors.externalService(service, message, originalError?)
errors.configuration(message, configKey?)
errors.businessRule(message, rule?, meta?)
```

## Advanced Usage

### Custom Error Formatter

```typescript
app.use(
  createExpressErrorHandler({
    logger: logError,
    formatter: (error) => {
      if (AppError.isAppError(error)) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.meta,
          },
        };
      }
      return { success: false, error: { message: "Internal server error" } };
    },
  }),
);
```

### Error Response Format

Default JSON response:

```json
{
  "name": "NotFoundError",
  "code": "NOT_FOUND",
  "message": "User with identifier '123' not found",
  "statusCode": 404,
  "meta": {
    "resource": "User",
    "identifier": "123"
  }
}
```

### Result Type Utilities

```typescript
import {
  map,
  flatMap,
  unwrap,
  unwrapOr,
  isOk,
  isErr,
} from "@deepracticex/error-handling";

// Map over successful result
const doubled = map(result, (value) => value * 2);

// Chain operations
const chained = flatMap(result, (user) => getUserPosts(user.id));

// Unwrap or throw
const user = unwrap(result); // throws if error

// Unwrap with default
const user = unwrapOr(result, defaultUser);

// Type guards
if (isOk(result)) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

## Best Practices

1. **Use the error factory** for consistency:

   ```typescript
   throw errors.notFound("User", id); // ✅ Good
   throw new NotFoundError("User", id); // ✅ Also fine
   ```

2. **Preserve original errors** for debugging:

   ```typescript
   try {
     await externalAPI.call();
   } catch (e) {
     throw errors.externalService("PaymentAPI", "Payment failed", e);
   }
   ```

3. **Add context with meta**:

   ```typescript
   throw errors.validation("Invalid user data", {
     email: "must be valid email",
     age: "must be at least 18",
   });
   ```

4. **Use Result type for expected errors**:

   ```typescript
   // For operations where errors are part of normal flow
   async function findUser(id: string): Promise<Result<User, AppError>> {
     // ... implementation
   }
   ```

5. **Always use error middleware** as the last middleware in your app.

## Integration with Logger

```typescript
import { error as logError, info } from "@deepracticex/logger";
import {
  createExpressErrorHandler,
  AppError,
} from "@deepracticex/error-handling";

app.use(
  createExpressErrorHandler({
    logger: (message, context) => {
      if (context?.statusCode && context.statusCode >= 500) {
        logError(message, context);
      } else {
        info(message, context);
      }
    },
  }),
);
```

## TypeScript Support

Full TypeScript support with proper type inference:

```typescript
import type { AppError, Result } from "@deepracticex/error-handling";

// Result type automatically infers success/error types
async function getUser(id: string): Promise<Result<User, AppError>> {
  // TypeScript knows result.value is User when result.ok === true
  // and result.error is AppError when result.ok === false
}
```

## License

MIT
