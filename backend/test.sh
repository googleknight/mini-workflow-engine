#!/bin/bash
set -e

BASE_URL="http://localhost:4000"

echo "1. Health Check"
curl -s "$BASE_URL/health" | grep "ok" && echo " - OK" || echo " - FAILED"

echo "2. Create Workflow"
RESPONSE=$(curl -s -X POST "$BASE_URL/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test Workflow",
    "enabled": true,
    "steps": [
      {
        "type": "filter",
        "conditions": [
          { "path": "type", "op": "eq", "value": "test" }
        ]
      }
    ]
  }')
echo $RESPONSE
ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Created Workflow ID: $ID"

if [ -z "$ID" ]; then
  echo "Failed to create workflow"
  exit 1
fi

echo "3. Get All Workflows"
curl -s "$BASE_URL/workflows" | grep "$ID" && echo " - OK" || echo " - FAILED"

echo "4. Get One Workflow"
curl -s "$BASE_URL/workflows/$ID" | grep "Integration Test Workflow" && echo " - OK" || echo " - FAILED"

echo "5. Update Workflow"
curl -s -X PATCH "$BASE_URL/workflows/$ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Workflow Name"}' | grep "Updated Workflow Name" && echo " - OK" || echo " - FAILED"

echo "6. Delete Workflow"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/workflows/$ID")
if [ "$STATUS" == "204" ]; then
  echo " - OK"
else
  echo " - FAILED (Status: $STATUS)"
fi

echo "7. Verify Deletion"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/workflows/$ID")
if [ "$STATUS" == "404" ]; then
  echo " - OK"
else
  echo " - FAILED (Status: $STATUS)"
fi

echo "All tests passed!"
