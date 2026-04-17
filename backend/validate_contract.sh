#!/bin/bash

# Configuration
BASE_URL="http://localhost:8000/api/v1"
TEST_PHONE="+919999999999"
TEST_OTP="123456"

echo "=== WORKER DASHBOARD ENDPOINT VALIDATION ==="
echo ""

# 1. Setup: Register a worker and activate policy to have data
echo "Setting up test worker..."
# Send OTP
curl -s -X POST "$BASE_URL/auth/send-otp" -H "Content-Type: application/json" -d "{\"phone\":\"$TEST_PHONE\"}" > /dev/null
# Verify OTP
TOKEN=$(curl -s -X POST "$BASE_URL/auth/verify-otp" -H "Content-Type: application/json" -d "{\"phone\":\"$TEST_PHONE\",\"otp\":\"$TEST_OTP\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

if [ -z "$TOKEN" ] || [ "$TOKEN" == "None" ]; then
    echo "❌ Failed to get auth token. Is the server running?"
    exit 1
fi

# Complete minimal onboarding
curl -s -X POST "$BASE_URL/auth/permissions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"permissions":["location"]}' > /dev/null
curl -s -X POST "$BASE_URL/workers/location" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"latitude":13.08,"longitude":80.27,"zone":"Anna Nagar"}' > /dev/null
curl -s -X POST "$BASE_URL/workers/work-profile" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"platform":"Uber","income_band":"₹15k - ₹25k","working_hours_per_day":8,"days_worked_per_week":6}' > /dev/null
curl -s -X POST "$BASE_URL/workers/register" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' > /dev/null

# Test 1: GET /claims/me
echo "TEST 1: GET /claims/me"
curl -s -X GET "$BASE_URL/claims/me" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool > /tmp/claims_response.json

echo "Checking response structure..."
python3 -c "
import json
with open('/tmp/claims_response.json') as f:
    d = json.load(f)
    print('✅ status field') if d.get('status') == 'SUCCESS' else print('❌ status field')
    print('✅ data is array') if isinstance(d.get('data'), list) else print('❌ data NOT array')
    # If there are claims, check fields (likely empty now though)
"

# Test 2: POST /policies/quote
echo ""
echo "TEST 2: POST /policies/quote"
curl -s -X POST "$BASE_URL/policies/quote" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool > /tmp/quote_response.json

echo "Checking response structure..."
python3 -c "
import json
with open('/tmp/quote_response.json') as f:
    d = json.load(f)
    print('✅ status field') if d.get('status') == 'SUCCESS' else print('❌ status field')
    data = d.get('data', {})
    print('✅ recommended_tier') if 'recommended_tier' in data else print('❌ recommended_tier missing')
    print('✅ plans is array') if isinstance(data.get('plans'), list) else print('❌ plans not array')
    explanation = data.get('explanation', {})
    print('✅ explanation is struct') if isinstance(explanation, dict) else print('❌ explanation not struct')
    print('✅ SHAP values present') if 'primary_factors' in explanation and len(explanation['primary_factors']) > 0 else print('❌ SHAP values missing')
"

# Test 3: GET /dashboard/admin
echo ""
echo "TEST 3: GET /dashboard/admin"
curl -s -X GET "$BASE_URL/dashboard/admin" | python3 -m json.tool > /tmp/dashboard_response.json
echo "Checking response structure..."
python3 -c "
import json
with open('/tmp/dashboard_response.json') as f:
    d = json.load(f)
    data = d.get('data', {})
    print('✅ reserve_pool') if 'reserve_pool' in data else print('❌ reserve_pool missing')
    print('✅ claims_summary') if 'claims_summary' in data else print('❌ claims_summary missing')
"

echo ""
echo "=== VALIDATION COMPLETE ==="
