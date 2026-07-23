#!/bin/bash

BASE="/Users/pramod/Downloads/prasunetos"

echo "Starting all frontend portals on ports 3000-3006..."

# Port 3000: Web Frontend
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-web-frontend"' && npm run dev"'
sleep 0.3

# Port 3001: Management Frontend
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-management-frontend"' && npm run dev"'
sleep 0.3

# Port 3002: Student Frontend
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-student-frontend"' && npm run dev"'
sleep 0.3

# Port 3003: Staff Frontend
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-staff-frontend"' && npm run dev"'
sleep 0.3

# Port 3004: Parents Frontend
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-parents-frontend"' && npm run dev"'
sleep 0.3

# Port 3005: Admin Frontend
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-admin-frontend"' && npm run dev"'
sleep 0.3

# Port 3006: Job Provider Frontend
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-jobprovider-frontend"' && npm run dev"'

echo "All 7 portals launched in Terminal windows!"
