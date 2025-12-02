#!/bin/bash

echo "Killing all frontend and backend processes..."

# Kill by port
echo "Killing process on port 5000 (Backend)..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo "Killing process on port 3000 (Frontend)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "Killing process on port 3001 (Frontend)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "Killing process on port 3002 (Frontend)..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Kill by process name
echo "Killing all python run.py processes..."
pkill -9 -f "python run.py" 2>/dev/null || true

echo "Killing all npm dev processes..."
pkill -9 -f "npm run dev" 2>/dev/null || true

echo "Killing all node processes (Next.js)..."
pkill -9 -f "node.*next" 2>/dev/null || true

sleep 1
echo "All servers killed!"
