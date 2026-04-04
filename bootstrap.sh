#!/bin/bash
BASE_URL="http://localhost:8000/api/v1"
PHONE="+919876543210"

echo "1. Send OTP"
curl -s -X POST "$BASE_URL/auth/send-otp" -H "Content-Type: application/json" -d "{\"phone\": \"$PHONE\"}"
echo -e "\n2. Verify OTP"
TOKEN=$(curl -s -X POST "$BASE_URL/auth/verify-otp" -H "Content-Type: application/json" -d "{\"phone\": \"$PHONE\", \"otp\": \"123456\"}" | jq -r .data.token)
echo "TOKEN: $TOKEN"
echo "3. Permissions"
curl -s -X POST "$BASE_URL/auth/permissions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"location_consent": true, "notification_consent": true, "data_consent": true}'
echo -e "\n4. Aadhaar"
curl -s -X POST "$BASE_URL/auth/send-aadhaar-otp" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"aadhaar_number": "123456789012"}'
curl -s -X POST "$BASE_URL/auth/verify-aadhaar-otp" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"otp": "123456"}'
echo -e "\n5. Selfie"
curl -s -X POST "$BASE_URL/auth/verify-selfie" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"selfie_mock_payload": "..."}'
echo -e "\n6. Location"
curl -s -X POST "$BASE_URL/workers/location" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"lat": 13.085, "lng": 80.210, "city": "Chennai", "zone": "Anna Nagar"}'
echo -e "\n7. Work Profile"
curl -s -X POST "$BASE_URL/workers/work-profile" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"platform": "Swiggy", "working_hours_per_day": 8, "days_worked_per_week": 6, "income_band": "5,000 - 7,000"}'
echo -e "\n8. UPI"
curl -s -X POST "$BASE_URL/workers/upi" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"upi_id": "9876543210@paytm"}'
echo -e "\n9. Register"
curl -s -X POST "$BASE_URL/workers/register" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"confirm": true}'
echo -e "\n10. mPIN"
curl -s -X POST "$BASE_URL/auth/set-mpin" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"mpin": "1234"}'
echo -e "\n11. Acknowledge"
curl -s -X POST "$BASE_URL/policies/acknowledge" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"premium_acknowledged": true, "coverage_acknowledged": true, "exclusions_acknowledged": true, "terms_accepted": true, "privacy_accepted": true}'
echo -e "\n12. Activate"
curl -s -X POST "$BASE_URL/policies/activate" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"tier": "Standard"}'
echo -e "\nTOKEN=$TOKEN" > .env_test
