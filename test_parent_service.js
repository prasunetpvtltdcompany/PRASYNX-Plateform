process.env.PORT = '4005';
process.env.SUPABASE_URL = 'https://axwhtngxveaidbscsrca.supabase.co';
process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';
process.env.JWT_SECRET = '6d877304dc4de306adee6f9c9c481b27fb032f01d0c5a620aa98c809cef88641';
process.env.JWT_EXPIRES_IN = '24h';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTY3NDIsImV4cCI6MjA5MzAzMjc0Mn0.1ZgcgPiH8l6kJ7KzHLgIYD_ZFo9o3WaoIWBKRqRikSI';

const { attendanceService } = require('./prasynx-parents-backend/dist/services/attendance.service.js');
const { parentService } = require('./prasynx-parents-backend/dist/services/parent.service.js');

async function main() {
  const studentId = 'd4252599-1ae6-4bb7-a4ee-1821e673bada';
  
  console.log("=== CALLING ATTENDANCE SERVICE ===");
  const attData = await attendanceService.getAttendance(studentId);
  console.log("Attendance Data:", attData);
  
  console.log("\n=== CALLING PARENT SERVICE GET DASHBOARD ===");
  const dashData = await parentService.getDashboard('66092c42-e095-43fe-a3cd-197aedbfc94f', '66092c42-e095-43fe-a3cd-197aedbfc94f');
  console.log("Dashboard Children list:", dashData.children);
  console.log("Dashboard attendance warnings:", dashData.attendanceWarnings);
}

main().catch(console.error);
