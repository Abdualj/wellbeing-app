# Technical Guide - Wellbeing Application Backend

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Authentication Flow](#authentication-flow)
4. [Database Design](#database-design)
5. [API Usage](#api-usage)
6. [Adding New Features](#adding-new-features)
7. [Security Implementation](#security-implementation)
8. [GDPR Compliance](#gdpr-compliance)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

## Getting Started

### Initial Setup

1. Ensure prerequisites are installed:
   - Node.js 18 or higher
   - Docker Desktop (for database)
   - A code editor (VS Code recommended)

2. Clone the repository and install dependencies:

```bash
npm install
```

3. Create environment file from template:

```bash
cp .env.example .env
```

4. Start PostgreSQL database:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. Initialize database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

6. Start development server:

```bash
npm run dev
```

The server starts on port 3000. Access API documentation at http://localhost:3000/api-docs

### Understanding the Codebase

The application uses a layered architecture:

- Routes: Define HTTP endpoints and attach middleware
- Controllers: Handle HTTP requests and responses
- Services: Contain business logic
- Middleware: Cross-cutting concerns (auth, validation, logging)
- Config: Application configuration and setup

## Architecture Overview

### Request Flow

When a client makes a request, it flows through these layers:

1. HTTP Request arrives at Express server
2. Route matches and triggers middleware chain
3. Authentication middleware verifies JWT token
4. Authorization middleware checks permissions
5. Validation middleware validates request data
6. Controller receives validated request
7. Controller calls appropriate service method
8. Service executes business logic
9. Service uses Prisma to access database
10. Response flows back through the chain
11. Error handler catches any exceptions

### Directory Structure

```
src/
├── config/
│   ├── database.ts      - Prisma client initialization
│   ├── index.ts         - Configuration loading from environment
│   └── logger.ts        - Winston logger setup
│
├── middleware/
│   ├── auth.ts          - JWT authentication
│   ├── authorization.ts - Role-based access control
│   ├── validator.ts     - Request validation
│   ├── errorHandler.ts  - Global error handling
│   └── auditLog.ts      - Audit logging
│
├── controllers/
│   ├── auth.controller.ts   - Authentication endpoints
│   ├── user.controller.ts   - User management
│   ├── group.controller.ts  - Group operations
│   ├── post.controller.ts   - Posts and comments
│   └── event.controller.ts  - Event management
│
├── services/
│   ├── auth.service.ts      - Authentication logic
│   ├── user.service.ts      - User operations
│   ├── group.service.ts     - Group management
│   ├── post.service.ts      - Post operations
│   └── event.service.ts     - Event logic
│
├── routes/
│   ├── index.ts            - Route aggregation
│   ├── auth.routes.ts      - Auth endpoints
│   ├── user.routes.ts      - User endpoints
│   ├── group.routes.ts     - Group endpoints
│   ├── post.routes.ts      - Post endpoints
│   ├── event.routes.ts     - Event endpoints
│   └── health.routes.ts    - Health checks
│
├── app.ts    - Express application setup
└── server.ts - Server initialization and startup
```

## Authentication Flow

### Registration

1. Client sends POST request to /api/v1/auth/register with:
   - Email
   - Password
   - Name fields
   - GDPR consent flags

2. Server validates input and checks for existing user

3. Password is hashed using bcrypt with 10 salt rounds

4. User record created in database with consent tracking

5. JWT access token and refresh token generated

6. Tokens returned to client

### Login

1. Client sends POST request to /api/v1/auth/login with credentials

2. Server finds user by email

3. Password verified using bcrypt.compare

4. Last login timestamp updated

5. New access token and refresh token generated

6. Tokens returned to client

### Token Usage

Access tokens are short-lived (7 days default) and included in Authorization header:

```
Authorization: Bearer {access_token}
```

When access token expires, client uses refresh token to get new access token via /api/v1/auth/refresh endpoint.

### Protected Routes

Protected routes use authenticate middleware:

```typescript
router.get("/profile", authenticate, controller.getProfile);
```

The middleware:

1. Extracts token from Authorization header
2. Verifies token signature with JWT secret
3. Checks if user exists and is active
4. Attaches user info to request object
5. Passes control to next handler

## Database Design

### Core Models

**User**

- Stores user accounts and authentication data
- Includes GDPR consent fields
- Tracks notification preferences
- Links to all user-generated content

**Group**

- Represents small communities (4-12 members)
- Has privacy settings and approval requirements
- Tracks member capacity

**Membership**

- Junction table between User and Group
- Stores role (Member, Facilitator, Admin)
- Tracks invitation status and join date

**Post**

- User content within groups
- Only visible to group members
- Can be soft-deleted

**Comment**

- Responses to posts
- Nested under posts
- Support soft deletion

**Event**

- Group activities with time and location
- Supports capacity limits
- Can be cancelled

**EventParticipant**

- RSVP responses (Going, Maybe, Not Going)
- Links users to events

**RefreshToken**

- JWT refresh tokens for authentication
- Can be revoked

**AuditLog**

- Records critical user actions
- Supports GDPR compliance
- Includes metadata about actions

### Relationships

- User has many Memberships
- Group has many Memberships
- Group has many Posts
- Group has many Events
- Post has many Comments
- Event has many EventParticipants
- User has many RefreshTokens
- User has many AuditLogs

### Indexes

Strategic indexes improve query performance:

- User.email (unique)
- Membership composite (userId, groupId)
- Post.groupId and Post.createdAt
- Event.groupId and Event.startTime
- AuditLog.userId and AuditLog.createdAt

## API Usage

### Making Requests

All API requests should:

1. Use correct HTTP method (GET, POST, PUT, DELETE)
2. Set Content-Type: application/json for requests with body
3. Include Authorization header for protected endpoints
4. Follow endpoint-specific validation rules

### Response Format

All responses follow consistent format:

Success:

```json
{
  "status": "success",
  "data": { ... }
}
```

Error:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Example: Creating a Group

Request:

```bash
POST /api/v1/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mindfulness Circle",
  "description": "A supportive community",
  "maxMembers": 10,
  "isPrivate": true
}
```

Response (201 Created):

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Mindfulness Circle",
    "description": "A supportive community",
    "maxMembers": 10,
    "isPrivate": true,
    "createdAt": "2026-01-29T10:00:00.000Z"
  }
}
```

### Example: Group Post Flow

1. Create post in group:

```bash
POST /api/v1/groups/{groupId}/posts
Authorization: Bearer {token}

{
  "content": "Looking forward to our next meeting!"
}
```

2. Get posts for group:

```bash
GET /api/v1/groups/{groupId}/posts?limit=20&offset=0
Authorization: Bearer {token}
```

3. Add comment to post:

```bash
POST /api/v1/posts/{postId}/comments
Authorization: Bearer {token}

{
  "content": "Me too! See you there."
}
```

## Adding New Features

### Creating a New Endpoint

Follow this pattern to add new functionality:

1. **Define Database Model** (prisma/schema.prisma):

```prisma
model NewFeature {
  id        String   @id @default(uuid())
  name      String
  userId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  @@map("new_features")
}
```

2. **Create Service** (src/services/newfeature.service.ts):

```typescript
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";

export class NewFeatureService {
  async create(userId: string, data: any) {
    return await prisma.newFeature.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async findById(id: string) {
    const feature = await prisma.newFeature.findUnique({
      where: { id },
    });

    if (!feature) {
      throw new AppError("Feature not found", 404);
    }

    return feature;
  }
}
```

3. **Create Controller** (src/controllers/newfeature.controller.ts):

```typescript
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { NewFeatureService } from "../services/newfeature.service";
import { asyncHandler } from "../middleware/errorHandler";

const service = new NewFeatureService();

export const create = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const feature = await service.create(userId, req.body);

    res.status(201).json({
      status: "success",
      data: feature,
    });
  },
);
```

4. **Create Routes** (src/routes/newfeature.routes.ts):

```typescript
import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validator";
import { authenticate } from "../middleware/auth";
import * as controller from "../controllers/newfeature.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate([body("name").notEmpty().withMessage("Name is required")]),
  controller.create,
);

export default router;
```

5. **Register Routes** (src/routes/index.ts):

```typescript
import newFeatureRoutes from "./newfeature.routes";

router.use("/new-features", newFeatureRoutes);
```

6. **Run Migration**:

```bash
npx prisma migrate dev --name add_new_feature
```

## Security Implementation

### Password Security

Passwords are hashed using bcrypt before storage:

```typescript
import bcrypt from "bcrypt";

// Hashing
const passwordHash = await bcrypt.hash(password, 10);

// Verification
const isValid = await bcrypt.compare(plainPassword, passwordHash);
```

Never log or expose password hashes.

### JWT Tokens

Access tokens contain minimal user information:

```typescript
const token = jwt.sign({ id: userId, email: userEmail }, config.jwt.secret, {
  expiresIn: "7d",
});
```

Refresh tokens are stored in database and can be revoked.

### Input Validation

All endpoints validate input using express-validator:

```typescript
validate([body("email").isEmail(), body("age").isInt({ min: 18, max: 120 })]);
```

Validation errors return 400 Bad Request with details.

### Authorization Patterns

**Group Member Check**:

```typescript
export const isGroupMember = async (req, res, next) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_groupId: {
        userId: req.user.id,
        groupId: req.params.groupId,
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    throw new AppError("Access denied", 403);
  }

  next();
};
```

**Facilitator Check**:
Similar pattern but checks role is FACILITATOR or ADMIN.

### Rate Limiting

Global rate limit: 100 requests per 15 minutes per IP.

Configured in app.ts:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);
```

## GDPR Compliance

### Consent Management

Users must provide explicit consent during registration:

```typescript
{
  consentGiven: true,
  dataProcessingConsent: true,
  marketingConsent: false  // optional
}
```

Consent is timestamped and can be updated:

```typescript
await userService.updateConsent(userId, {
  dataProcessingConsent: true,
  marketingConsent: false,
});
```

### Data Export

Users can export all their data:

```bash
GET /api/v1/users/export-data
Authorization: Bearer {token}
```

Returns JSON with:

- User profile
- Group memberships
- Posts and comments
- Event participations
- Consent history

Excludes: password hash and internal IDs.

### Right to be Forgotten

Users can request account deletion:

```bash
POST /api/v1/users/data-deletion
Authorization: Bearer {token}
```

Process:

1. Account marked for deletion
2. User logged out (tokens revoked)
3. 30-day waiting period begins
4. After waiting period, background job anonymizes data
5. Personal information replaced with "Deleted User"
6. Content preserved but anonymized

### Audit Logging

Critical actions are logged:

- User registration
- Login attempts
- Consent changes
- Data exports
- Deletion requests
- Group creation/deletion
- Member removal

Audit logs include:

- User ID
- Action type
- Timestamp
- IP address
- User agent
- Metadata

## Error Handling

### Error Types

**AppError**: Expected errors with specific status codes

```typescript
throw new AppError("User not found", 404);
throw new AppError("Unauthorized", 401);
throw new AppError("Invalid input", 400);
```

**Validation Errors**: Handled by validator middleware, return 400.

**Unexpected Errors**: Caught by global error handler, return 500.

### Error Handler

Global error handler in middleware/errorHandler.ts:

```typescript
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Unexpected error
  logger.error("Unexpected error:", err);

  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
};
```

### Async Error Handling

Use asyncHandler wrapper for async routes:

```typescript
export const handler = asyncHandler(async (req, res, next) => {
  // Any errors thrown here are caught and passed to error handler
  const data = await service.getData();
  res.json({ status: "success", data });
});
```

## Testing

### Unit Testing

Test services in isolation:

```typescript
import { AuthService } from "../services/auth.service";

describe("AuthService", () => {
  const authService = new AuthService();

  it("should register a new user", async () => {
    const userData = {
      email: "test@example.com",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
      consentGiven: true,
      dataProcessingConsent: true,
    };

    const result = await authService.register(userData);

    expect(result.user.email).toBe(userData.email);
    expect(result.accessToken).toBeDefined();
  });
});
```

### Integration Testing

Test full request/response cycle:

```typescript
import request from "supertest";
import app from "../app";

describe("POST /api/v1/auth/register", () => {
  it("should register a user and return tokens", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      email: "newuser@example.com",
      password: "SecurePass123!",
      firstName: "New",
      lastName: "User",
      consentGiven: true,
      dataProcessingConsent: true,
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.accessToken).toBeDefined();
  });
});
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

## Deployment

### Environment Configuration

Production environment variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<64-character-random-string>
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info
```

Generate secure secrets:

```bash
openssl rand -base64 48
```

### Docker Deployment

1. Build image:

```bash
docker build -t wellbeing-app:latest .
```

2. Run with docker-compose:

```bash
docker-compose up -d
```

This starts:

- PostgreSQL database
- Backend application
- PGAdmin (database management UI)

Access application on port 3000, PGAdmin on port 5050.

### Database Migrations

In production, run migrations before starting application:

```bash
npx prisma migrate deploy
```

This applies pending migrations without prompting.

### Process Management

Use PM2 for production:

```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

PM2 provides:

- Automatic restarts on crashes
- Load balancing across CPU cores
- Log management
- Process monitoring

### Health Checks

Monitor application health:

```bash
curl http://localhost:3000/api/v1/health
```

Returns:

```json
{
  "status": "success",
  "message": "Server is healthy",
  "timestamp": "2026-01-29T10:00:00.000Z",
  "uptime": 12345.67
}
```

Set up external monitoring to ping this endpoint regularly.

### Logging

Application logs to:

- logs/combined.log - All logs
- logs/error.log - Errors only
- Console (development only)

In production, forward logs to centralized logging service.

### Backup Strategy

Database backups:

```bash
pg_dump $DATABASE_URL > backup.sql
```

Schedule regular backups:

- Daily full backups
- Retain for 30 days
- Store in secure, separate location
- Test restore process regularly

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:

1. Check if PostgreSQL is running:

```bash
docker ps
```

2. Verify DATABASE_URL in .env file

3. Check database logs:

```bash
docker logs wellbeing-db-dev
```

4. Restart database:

```bash
docker-compose -f docker-compose.dev.yml restart
```

### Port Already in Use

**Problem**: Error: Port 3000 already in use

**Solution**:

```bash
lsof -i :3000
kill -9 <PID>
```

Or change PORT in .env file.

### Prisma Client Errors

**Problem**: Prisma Client not generated or outdated

**Solution**:

```bash
rm -rf node_modules/.prisma
npm run prisma:generate
```

### Migration Errors

**Problem**: Migration failed or conflicts

**Solutions**:

1. Check migration status:

```bash
npx prisma migrate status
```

2. Reset database (WARNING: deletes all data):

```bash
npx prisma migrate reset
```

3. For production, resolve conflicts manually and use:

```bash
npx prisma migrate resolve --applied <migration-name>
```

### Authentication Errors

**Problem**: JWT verification fails

**Causes**:

1. Token expired - use refresh token to get new access token
2. Invalid secret - ensure JWT_SECRET matches between requests
3. Malformed token - check token format

**Solution**: Clear tokens and re-authenticate.

### Performance Issues

**Indicators**:

- Slow response times
- Database query timeouts
- High CPU usage

**Solutions**:

1. Check database indexes:

```bash
npm run prisma:studio
```

2. Monitor query performance:
   Enable Prisma query logging in development.

3. Add pagination to large result sets.

4. Implement caching for frequently accessed data.

5. Use database connection pooling in production.

### Memory Leaks

**Indicators**:

- Gradual memory increase
- Application crashes after extended runtime

**Solutions**:

1. Monitor with PM2:

```bash
pm2 monit
```

2. Check for unclosed database connections.

3. Review event listeners for proper cleanup.

4. Use heap snapshots to identify leaks.

## Best Practices

### Code Organization

- Keep controllers thin - delegate to services
- Services contain business logic only
- Use TypeScript types for all data
- Write self-documenting code
- Follow single responsibility principle

### Security

- Never log sensitive data (passwords, tokens)
- Validate all user input
- Use parameterized queries (Prisma handles this)
- Keep dependencies updated
- Use environment variables for secrets
- Implement rate limiting on all routes
- Add audit logging for sensitive operations

### Performance

- Use database indexes for common queries
- Paginate large result sets
- Cache frequently accessed data
- Use select to limit returned fields
- Avoid N+1 queries
- Use database transactions for multi-step operations

### Testing

- Write tests for business logic
- Test error cases
- Use test database, never production
- Mock external services
- Aim for high code coverage
- Test authentication and authorization

### Maintenance

- Document complex logic
- Use meaningful variable names
- Keep functions small and focused
- Remove dead code
- Update dependencies regularly
- Monitor application logs
- Review audit logs periodically

## Additional Resources

- Prisma Documentation: https://www.prisma.io/docs
- Express.js Guide: https://expressjs.com/en/guide
- TypeScript Handbook: https://www.typescriptlang.org/docs
- JWT Best Practices: https://jwt.io/introduction
- GDPR Guidelines: https://gdpr.eu
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices

For project-specific questions, consult the API documentation at /api-docs when the server is running.
