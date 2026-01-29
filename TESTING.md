# Testing Guide - Wellbeing Application Backend

This guide walks you through testing the backend API to ensure everything works correctly.

## Quick Start Testing

### Step 1: Start the Database

```bash
# Start PostgreSQL with Docker
docker-compose -f docker-compose.dev.yml up -d

# Verify it's running
docker ps
```

You should see a container named `wellbeing-db-dev` running on port 5432.

### Step 2: Initialize the Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed test data (creates 3 test users)
npm run prisma:seed
```

### Step 3: Start the Server

```bash
# Start development server
npm run dev
```

The server should start on `http://localhost:3000`

### Step 4: Verify Health Check

Open a new terminal and run:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "success",
  "message": "Server is healthy",
  "timestamp": "2026-01-29T...",
  "uptime": 12.34
}
```

## Testing with cURL

### Test 1: Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "consentGiven": true,
    "dataProcessingConsent": true
  }'
```

**Expected Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Save the `accessToken` for subsequent requests!**

### Test 2: Login with Seeded User

The seed script creates test users. Try logging in:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Password123!"
  }'
```

**Test User Credentials:**

- alice@example.com / Password123!
- bob@example.com / Password123!
- carol@example.com / Password123!

### Test 3: Get User Profile

Replace `YOUR_TOKEN` with the accessToken from login/register:

```bash
curl http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "notificationPreference": "NORMAL",
    "createdAt": "2026-01-29T..."
  }
}
```

### Test 4: Create a Group

```bash
curl -X POST http://localhost:3000/api/v1/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mindfulness Circle",
    "description": "A supportive community for mindfulness practice",
    "maxMembers": 10,
    "isPrivate": true
  }'
```

**Save the `groupId` from the response!**

### Test 5: Create a Post in Group

Replace `GROUP_ID` with the ID from step 4:

```bash
curl -X POST http://localhost:3000/api/v1/groups/GROUP_ID/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Welcome to our mindfulness community! Looking forward to connecting with everyone."
  }'
```

### Test 6: Get Group Posts

```bash
curl "http://localhost:3000/api/v1/groups/GROUP_ID/posts?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 7: Create an Event

```bash
curl -X POST http://localhost:3000/api/v1/groups/GROUP_ID/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekly Meditation Session",
    "description": "Join us for guided meditation",
    "startTime": "2026-02-05T18:00:00Z",
    "endTime": "2026-02-05T19:00:00Z",
    "location": "Community Center",
    "maxParticipants": 8
  }'
```

### Test 8: RSVP to Event

Replace `EVENT_ID` with the ID from step 7:

```bash
curl -X POST http://localhost:3000/api/v1/events/EVENT_ID/rsvp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "GOING"
  }'
```

### Test 9: Test GDPR Export

```bash
curl http://localhost:3000/api/v1/users/export-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > my-data-export.json
```

This downloads all your user data to a file.

## Testing with Postman/Insomnia

If you prefer a GUI tool:

### 1. Import the API

1. Start your server: `npm run dev`
2. Access Swagger docs: http://localhost:3000/api-docs
3. Download the OpenAPI spec from the docs
4. Import into Postman or Insomnia

### 2. Set Up Environment Variables

Create variables in your HTTP client:

- `BASE_URL`: http://localhost:3000/api/v1
- `ACCESS_TOKEN`: (will be set after login)

### 3. Authentication Flow

1. **Register or Login** → Save the `accessToken`
2. **Set Authorization Header** for all protected routes:
   - Type: Bearer Token
   - Token: {{ACCESS_TOKEN}}

### 4. Test Complete User Flow

1. Register new user
2. Login (get tokens)
3. Get profile
4. Update profile
5. Create group
6. Create post
7. Add comment
8. Create event
9. RSVP to event
10. Export data

## Automated Testing Script

I've created a test script for you. Run it with:

```bash
npm run test:api
```

This script will:

- Register a test user
- Login
- Create a group
- Create a post
- Add a comment
- Create an event
- RSVP to the event
- Export data

## Testing Error Handling

### Test Invalid Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "WrongPassword"
  }'
```

**Expected: 401 Unauthorized**

### Test Missing Token

```bash
curl http://localhost:3000/api/v1/users/profile
```

**Expected: 401 Unauthorized**

### Test Invalid Token

```bash
curl http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer invalid-token-here"
```

**Expected: 401 Unauthorized**

### Test Validation Errors

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "weak"
  }'
```

**Expected: 400 Bad Request with validation errors**

### Test Access Control

Try to access a group you're not a member of:

```bash
# This should fail with 403 Forbidden
curl http://localhost:3000/api/v1/groups/non-member-group-id/posts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Database

### View Data with Prisma Studio

```bash
npm run prisma:studio
```

Opens a GUI at http://localhost:5555 to browse your database.

### Check Database Directly

```bash
# Connect to PostgreSQL
docker exec -it wellbeing-db-dev psql -U wellbeing_user -d wellbeing_db

# List tables
\dt

# View users
SELECT id, email, "firstName", "lastName" FROM users;

# Exit
\q
```

## Testing Logs

View application logs:

```bash
# In development (watch terminal where server is running)
npm run dev

# Or check log files
cat logs/combined.log
cat logs/error.log
```

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Database Connection Failed

```bash
# Restart database
docker-compose -f docker-compose.dev.yml restart

# Check database logs
docker logs wellbeing-db-dev
```

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

### Tokens Not Working

- Tokens expire after 7 days (access) and 30 days (refresh)
- Use the refresh token endpoint to get a new access token
- Or just login again

## Performance Testing

### Test Rate Limiting

The API limits to 100 requests per 15 minutes per IP. Test it:

```bash
# Run this in a loop (will eventually get rate limited)
for i in {1..110}; do
  curl http://localhost:3000/api/v1/health
  echo " - Request $i"
done
```

After 100 requests, you should get: **429 Too Many Requests**

## Next Steps

Once basic testing works:

1. **Write Unit Tests**: Add tests in `src/__tests__/`
2. **Integration Tests**: Test full API workflows
3. **Load Testing**: Use tools like Apache Bench or k6
4. **Security Testing**: Check for common vulnerabilities
5. **Frontend Integration**: Connect your frontend app

## Testing Checklist

- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] User registration works
- [ ] Login returns valid tokens
- [ ] Protected routes require authentication
- [ ] Group creation works
- [ ] Posts can be created and retrieved
- [ ] Comments can be added
- [ ] Events can be created and RSVPs work
- [ ] GDPR export returns data
- [ ] Error handling works correctly
- [ ] Rate limiting activates after 100 requests
- [ ] Database persists data correctly
- [ ] Audit logs are created
- [ ] Tokens can be refreshed

## Support

If something doesn't work:

1. Check the terminal for error messages
2. Review logs in `logs/` directory
3. Verify database is running: `docker ps`
4. Check environment variables in `.env`
5. Ensure all migrations ran: `npm run prisma:migrate`
6. Try restarting: Stop server, restart database, start server

Happy testing! 🧪
