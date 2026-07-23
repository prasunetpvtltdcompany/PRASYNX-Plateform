#!/bin/bash

BASE="$HOME/Downloads/prasunetos"

osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-admin-backend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-admin-frontend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-management-backend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-management-frontend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-staff-backend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-staff-frontend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-student-backend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-student-frontend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-parents-backend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-parents-frontend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-web-backend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-web-frontend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-jobprovider-backend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-jobprovider-frontend"' && npm run dev"'
sleep 0.3
osascript -e 'tell app "Terminal" to do script "cd '"$BASE/prasynx-voiceai-backend"' && npm run dev"'

