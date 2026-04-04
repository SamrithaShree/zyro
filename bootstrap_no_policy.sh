#!/bin/bash
BASE_URL="http://localhost:8000/api/v1"
PHONE="+911111111111"

curl -s -X POST "$BASE_URL/auth/send-otp" -H "Content-Type: application/json" -d "{\"phone\": \"$PHONE\"}" > /dev/null
TOKEN=$(curl -s -X POST "$BASE_URL/auth/verify-otp" -H "Content-Type: application/json" -d "{\"phone\": \"$PHONE\", \"otp\": \"123456\"}" | jq -r .data.token)
curl -s -X POST "$BASE_URL/auth/permissions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"location_consent": true, "notification_consent": true, "data_consent": true}' > /dev/null
curl -s -X POST "$BASE_URL/auth/send-aadhaar-otp" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"aadhaar_number": "111122223333"}' > /dev/null
curl -s -X POST "$BASE_URL/auth/verify-aadhaar-otp" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"otp": "123456"}' > /dev/null
curl -s -X POST "$BASE_URL/auth/verify-selfie" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"selfie_mock_payload": "..."}' > /dev/null
curl -s -X POST "$BASE_URL/workers/location" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"city": "Chennai", "zone": "Anna Nagar"}' > /dev/null
curl -s -X POST "$BASE_URL/workers/work-profile" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"platform": "Zomato", "working_hours_per_day": 8, "days_worked_per_week": 6, "income_band": "3,000 - 5,000"}' > /dev/null
curl -s -X POST "$BASE_URL/workers/upi" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"upi_id": "1111111111@upi"}' > /dev/null
curl -s -X POST "$BASE_URL/workers/register" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"confirm": true}' > /dev/null
echo "$TOKEN"
