#!/bin/bash

# Wellbeing App API Test Script
# This script tests the main API endpoints

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000/api/v1"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((TESTS_FAILED++))
    fi
}

# Helper function to extract JSON field
extract_json() {
    echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | cut -d'"' -f4
}

echo "========================================="
echo "Wellbeing App - API Test Suite"
echo "========================================="
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_test 0 "Server is healthy"
else
    print_test 1 "Server health check failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi
echo ""

# Test 2: Register a new user
echo -e "${YELLOW}Test 2: User Registration${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123!\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"consentGiven\": true,
    \"dataProcessingConsent\": true
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    ACCESS_TOKEN=$(extract_json "$RESPONSE_BODY" "accessToken")
    USER_ID=$(extract_json "$RESPONSE_BODY" "id")
    print_test 0 "User registered successfully"
    echo "   Email: $TEST_EMAIL"
else
    print_test 1 "User registration failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi
echo ""

# Test 3: Login
echo -e "${YELLOW}Test 3: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123!\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 200 ]; then
    print_test 0 "Login successful"
else
    print_test 1 "Login failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 4: Get Profile
echo -e "${YELLOW}Test 4: Get User Profile${NC}"
PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 200 ]; then
    print_test 0 "Profile retrieved successfully"
else
    print_test 1 "Get profile failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 5: Create a Group
echo -e "${YELLOW}Test 5: Create Group${NC}"
GROUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/groups" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Mindfulness Circle",
    "description": "A test group for mindfulness practice",
    "maxMembers": 10,
    "isPrivate": true
  }')

HTTP_CODE=$(echo "$GROUP_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$GROUP_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    GROUP_ID=$(extract_json "$RESPONSE_BODY" "id")
    print_test 0 "Group created successfully"
    echo "   Group ID: $GROUP_ID"
else
    print_test 1 "Group creation failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 6: Get User Groups
echo -e "${YELLOW}Test 6: Get User Groups${NC}"
GROUPS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/groups/my-groups" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$GROUPS_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 200 ]; then
    print_test 0 "Groups retrieved successfully"
else
    print_test 1 "Get groups failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 7: Create a Post
echo -e "${YELLOW}Test 7: Create Post in Group${NC}"
POST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/groups/$GROUP_ID/posts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Welcome to our test mindfulness community!"
  }')

HTTP_CODE=$(echo "$POST_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$POST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    POST_ID=$(extract_json "$RESPONSE_BODY" "id")
    print_test 0 "Post created successfully"
    echo "   Post ID: $POST_ID"
else
    print_test 1 "Post creation failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 8: Get Posts
echo -e "${YELLOW}Test 8: Get Group Posts${NC}"
POSTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/groups/$GROUP_ID/posts?limit=20&offset=0" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$POSTS_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 200 ]; then
    print_test 0 "Posts retrieved successfully"
else
    print_test 1 "Get posts failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 9: Add Comment
echo -e "${YELLOW}Test 9: Add Comment to Post${NC}"
COMMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great to be here!"
  }')

HTTP_CODE=$(echo "$COMMENT_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 201 ]; then
    print_test 0 "Comment added successfully"
else
    print_test 1 "Add comment failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 10: Create Event
echo -e "${YELLOW}Test 10: Create Event${NC}"
FUTURE_DATE=$(date -u -v+7d +"%Y-%m-%dT18:00:00Z" 2>/dev/null || date -u -d "+7 days" +"%Y-%m-%dT18:00:00Z")
END_DATE=$(date -u -v+7d +"%Y-%m-%dT19:00:00Z" 2>/dev/null || date -u -d "+7 days" +"%Y-%m-%dT19:00:00Z")

EVENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/groups/$GROUP_ID/events" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Meditation Session\",
    \"description\": \"Join us for guided meditation\",
    \"startTime\": \"$FUTURE_DATE\",
    \"endTime\": \"$END_DATE\",
    \"location\": \"Community Center\",
    \"maxParticipants\": 8
  }")

HTTP_CODE=$(echo "$EVENT_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$EVENT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    EVENT_ID=$(extract_json "$RESPONSE_BODY" "id")
    print_test 0 "Event created successfully"
    echo "   Event ID: $EVENT_ID"
else
    print_test 1 "Event creation failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 11: RSVP to Event
echo -e "${YELLOW}Test 11: RSVP to Event${NC}"
RSVP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "GOING"
  }')

HTTP_CODE=$(echo "$RSVP_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 200 ]; then
    print_test 0 "RSVP successful"
else
    print_test 1 "RSVP failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 12: Test Authentication (should fail without token)
echo -e "${YELLOW}Test 12: Test Authentication Protection${NC}"
NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/users/profile")
HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" -eq 401 ]; then
    print_test 0 "Authentication protection working"
else
    print_test 1 "Authentication protection failed (expected 401, got $HTTP_CODE)"
fi
echo ""

# Test 13: Export User Data (GDPR)
echo -e "${YELLOW}Test 13: GDPR Data Export${NC}"
EXPORT_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/users/export-data" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$EXPORT_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 200 ]; then
    print_test 0 "Data export successful"
else
    print_test 1 "Data export failed (HTTP $HTTP_CODE)"
fi
echo ""

# Summary
echo "========================================="
echo "Test Results Summary"
echo "========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check the output above.${NC}"
    exit 1
fi
