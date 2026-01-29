# Wellbeing and Small-Group Community Application - Backend

## Overview

This is a backend API server for a wellbeing application designed to support small-group community building for young adults experiencing loneliness, stress, or seeking low-threshold social interaction. The project follows User-Centered Design (UCD) principles and emphasizes privacy, GDPR compliance, and calm user experience support.

## Project Context

This backend was developed as part of a UX/UCD course project with the following objectives:

- Target Group: Young adults and adults experiencing loneliness or need for social connection
- Design Approach: User-Centered Design with usability testing
- Key Stakeholders: End users, group facilitators, developers, educational institution
- Core Focus: Privacy-first design, small closed groups, minimal notification load, GDPR compliance
- Evaluation Criteria: Requirements specification, UX quality, agile development process

## Technical Stack

- Runtime: Node.js 18+
- Language: TypeScript
- Framework: Express.js
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT (JSON Web Tokens)
- Documentation: Swagger/OpenAPI 3.0
- Logging: Winston
- Security: Helmet, CORS, Rate Limiting, bcrypt

## Core Features

### User Management

- User registration with explicit GDPR consent
- JWT-based authentication with refresh tokens
- Profile management with notification preferences
- GDPR compliance: data export and account deletion
- Privacy controls and consent management

### Group Management

- Small, closed groups (4-12 members maximum)
- Invitation-based membership
- Role-based access control (Member, Facilitator, Admin)
- Private group spaces with no public access
- Group member management and moderation

### Communication

- Group posts visible only to members
- Comment system for discussions
- Content moderation by facilitators
- No public feed or discovery mechanisms

### Event Planning

- Group event creation and management
- RSVP system with three states (Going, Maybe, Not Going)
- Capacity management
- Event participant tracking

### Security and Compliance

- Multi-layer security architecture
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Input validation on all endpoints
- Audit logging for critical actions
- GDPR-compliant data handling
- SQL injection protection via Prisma ORM

## Architecture

The application follows a clean layered architecture:

```
Routes -> Controllers -> Services -> Database
  |         |             |           |
Validation  Request    Business    Prisma ORM
            Handling    Logic      (PostgreSQL)
```

Key architectural decisions:

- Separation of concerns across layers
- Service layer contains all business logic
- Controllers handle HTTP requests/responses
- Middleware for cross-cutting concerns (auth, validation, logging)
- Prisma ORM for type-safe database access

## Database Schema

The database consists of 9 main entities:

- User: User accounts with GDPR compliance fields
- Group: Small, closed groups
- Membership: User-group relationships with roles
- Post: Group posts
- Comment: Post comments
- Event: Group events
- EventParticipant: Event RSVPs
- RefreshToken: JWT refresh tokens
- AuditLog: Action tracking for compliance

All tables include appropriate indexes for performance and foreign key constraints for data integrity.

## API Endpoints

The API provides over 35 endpoints organized into the following categories:

### Authentication (4 endpoints)

- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - User login
- POST /api/v1/auth/refresh - Refresh access token
- POST /api/v1/auth/logout - User logout

### Users (6 endpoints)

- GET /api/v1/users/profile - Get user profile
- PUT /api/v1/users/profile - Update profile
- PUT /api/v1/users/consent - Update GDPR consent
- POST /api/v1/users/data-deletion - Request account deletion
- GET /api/v1/users/export-data - Export user data
- GET /api/v1/users/groups - Get user's groups

### Groups (9 endpoints)

- POST /api/v1/groups - Create group
- GET /api/v1/groups/:id - Get group details
- PUT /api/v1/groups/:id - Update group
- DELETE /api/v1/groups/:id - Delete group
- GET /api/v1/groups/:id/members - Get members
- POST /api/v1/groups/:id/invite - Invite member
- POST /api/v1/groups/:id/accept - Accept invitation
- POST /api/v1/groups/:id/leave - Leave group
- DELETE /api/v1/groups/:id/members/:memberId - Remove member

### Posts (7 endpoints)

- POST /api/v1/groups/:id/posts - Create post
- GET /api/v1/groups/:id/posts - Get posts
- GET /api/v1/posts/:id - Get specific post
- PUT /api/v1/posts/:id - Update post
- DELETE /api/v1/posts/:id - Delete post
- POST /api/v1/posts/:id/comments - Add comment
- DELETE /api/v1/comments/:id - Delete comment

### Events (7 endpoints)

- POST /api/v1/groups/:id/events - Create event
- GET /api/v1/groups/:id/events - Get events
- GET /api/v1/events/:id - Get event details
- PUT /api/v1/events/:id - Update event
- POST /api/v1/events/:id/cancel - Cancel event
- POST /api/v1/events/:id/respond - RSVP to event
- GET /api/v1/events/:id/participants - Get participants

### Health (2 endpoints)

- GET /api/v1/health - Health check
- GET /api/v1/info - Server information

## Installation

### Prerequisites

- Node.js version 18 or higher
- PostgreSQL version 14 or higher
- Docker (recommended for development)
- npm or yarn package manager

### Setup Steps

1. Clone the repository and navigate to the project directory

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit the .env file with your configuration.

4. Start the database using Docker:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. Generate Prisma Client:

```bash
npm run prisma:generate
```

6. Run database migrations:

```bash
npm run prisma:migrate
```

7. Seed the database with test data (optional):

```bash
npm run prisma:seed
```

8. Start the development server:

```bash
npm run dev
```

The server will start at http://localhost:3000

## Development

### Available Scripts

- npm run dev - Start development server with hot reload
- npm run build - Build TypeScript to JavaScript
- npm start - Start production server
- npm test - Run tests
- npm run lint - Run ESLint
- npm run format - Format code with Prettier
- npm run prisma:generate - Generate Prisma Client
- npm run prisma:migrate - Run database migrations
- npm run prisma:studio - Open Prisma Studio GUI
- npm run prisma:seed - Seed database with test data

### Project Structure

```
src/
├── config/          - Application configuration
├── controllers/     - HTTP request handlers
├── middleware/      - Express middleware
├── routes/          - API route definitions
├── services/        - Business logic layer
├── app.ts           - Express application setup
└── server.ts        - Server entry point

prisma/
├── schema.prisma    - Database schema
└── seed.ts          - Database seeding script
```

## Testing

After seeding the database, the following test accounts are available:

Email: alice@example.com, Password: Password123! (Facilitator role)
Email: bob@example.com, Password: Password123! (Member role)
Email: carol@example.com, Password: Password123! (Member role)

## API Documentation

Once the server is running, comprehensive API documentation is available at:
http://localhost:3000/api-docs

The documentation is generated using Swagger/OpenAPI 3.0 and provides:

- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example payloads
- Error response formats

## Production Deployment

### Using Docker

1. Build the Docker image:

```bash
docker build -t wellbeing-app .
```

2. Start the full stack:

```bash
docker-compose up -d
```

### Environment Variables

Key environment variables for production:

- NODE_ENV=production
- PORT=3000
- DATABASE_URL=postgresql://user:password@host:5432/database
- JWT_SECRET=your-secure-secret-key
- JWT_REFRESH_SECRET=your-secure-refresh-key
- CORS_ORIGIN=https://your-frontend-domain.com

Generate secure secrets using:

```bash
openssl rand -base64 32
```

### Using Process Manager

Install PM2:

```bash
npm install -g pm2
```

Start application:

```bash
pm2 start ecosystem.config.js --env production
```

## GDPR Compliance

The application implements full GDPR compliance:

- Explicit consent tracking for data processing
- Right to access: Users can export all their data
- Right to be forgotten: Users can request account deletion
- Data minimization: Only essential data is collected
- Purpose limitation: Data used only for stated purposes
- Audit logging: All critical actions are logged
- Data retention policies: Configurable retention periods

## Security Measures

- JWT authentication with secure token generation
- Password hashing using bcrypt (10 rounds)
- Rate limiting to prevent abuse
- CORS protection with configurable origins
- Security headers via Helmet.js
- Input validation using express-validator
- SQL injection protection through Prisma ORM
- XSS protection through automatic escaping
- Role-based authorization for sensitive operations
- Audit logging for accountability

## UCD Alignment

The backend supports User-Centered Design principles:

- Privacy by Design: Closed groups, no public data access
- Calm UX Support: Minimal notification defaults, user-controlled settings
- Low Threshold: Simple, consistent API responses
- Safety: Facilitator oversight, content moderation capabilities
- Trust: GDPR compliance, audit trails, transparent data handling
- Accessibility: Clear error messages, comprehensive documentation
- Iteration Support: Clean architecture enables rapid changes

## Agile Development Support

The project structure supports agile development:

- Sprint-ready API endpoints mapped to user stories
- Incremental feature delivery capability
- Clean separation of concerns for parallel development
- Comprehensive documentation for team collaboration
- Automated testing support
- CI/CD pipeline for continuous integration

## Contributing

Development follows these principles:

1. Write clean, self-documenting code
2. Follow TypeScript best practices
3. Validate all inputs
4. Handle errors appropriately
5. Log important actions
6. Write tests for new features
7. Update documentation

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.
