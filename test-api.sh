#!/bin/bash

# Test script for Question Generator API

echo "🧪 Testing Choice Question Generator API"
echo "=========================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Error: Server is not running on http://localhost:3000"
    echo "Please start the server with: npm run start:dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test 1: Easy difficulty, JSON format
echo "📝 Test 1: Easy difficulty, JSON format"
echo "----------------------------------------"
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a Bible study teacher creating quiz questions.",
    "user_prompt": "The parable of the Good Samaritan teaches about showing compassion to others in need, regardless of their background. A traveler was beaten and left on the road. A priest and a Levite passed by without helping, but a Samaritan stopped, cared for the man, and paid for his recovery.",
    "number_of_questions": 3,
    "number_of_options": 4,
    "difficulty": "easy",
    "format": "json"
  }' 2>/dev/null | json_pp || echo "Response received (install json_pp for formatting)"

echo -e "\n\n"

# Test 2: Medium difficulty, Markdown format
echo "📝 Test 2: Medium difficulty, Markdown format"
echo "----------------------------------------------"
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a science teacher.",
    "user_prompt": "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. This process occurs in chloroplasts and requires water, carbon dioxide, and sunlight.",
    "number_of_questions": 2,
    "number_of_options": 3,
    "difficulty": "medium",
    "format": "markdown"
  }' 2>/dev/null | json_pp || echo "Response received"

echo -e "\n\n"

# Test 3: Validation error (invalid difficulty)
echo "📝 Test 3: Validation error test"
echo "---------------------------------"
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a teacher.",
    "user_prompt": "Test content.",
    "number_of_questions": 5,
    "number_of_options": 4,
    "difficulty": "super_hard",
    "format": "json"
  }' 2>/dev/null | json_pp || echo "Response received"

echo -e "\n\n"
echo "✅ All tests completed!"
