#!/bin/bash

echo "🚀 Starting WellSpring Development Servers"
echo "=========================================="
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend
echo "📡 Starting Backend (port 3000)..."
cd /Users/abdulaljubury/hybrid_applications/wellbeing-app
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend (port 5174)..."
cd /Users/abdulaljubury/hybrid_applications/wellbeing-app/frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 3

echo ""
echo "=========================================="
echo "✅ Servers Started!"
echo "=========================================="
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5174"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Check if servers are responding
echo "🔍 Checking server health..."
sleep 2

if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend may still be starting..."
fi

if curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend may still be starting..."
fi

echo ""
echo "Press Ctrl+C to stop following logs..."
echo ""

# Follow logs
tail -f backend.log frontend.log
