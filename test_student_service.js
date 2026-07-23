process.env.PORT = '4004';
process.env.SUPABASE_URL = 'https://axwhtngxveaidbscsrca.supabase.co';
process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';
process.env.JWT_SECRET = '4ce48c8946f0adf10da5674ec91286bcfae870d332211df470d0298ab1f7612c';
process.env.JWT_EXPIRES_IN = '24h';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTY3NDIsImV4cCI6MjA5MzAzMjc0Mn0.1ZgcgPiH8l6kJ7KzHLgIYD_ZFo9o3WaoIWBKRqRikSI';

const { dashboardService } = require('./prasynx-student-backend/dist/services/dashboard.service.js');
const { attendanceService } = require('./prasynx-student-backend/dist/services/attendance.service.js');

async function main() {
  const studentId = 'd4252599-1ae6-4bb7-a4ee-1821e673bada';
  
  console.log("=== CALLING DASHBOARD SERVICE ===");
  const dashData = await dashboardService.getDashboard(studentId);
  console.log("Dashboard Data:", JSON.stringify(dashData, null, 2));

  console.log("\n=== CALLING ATTENDANCE SERVICE ===");
  const attData = await attendanceService.getByStudent(studentId);
  console.log("Attendance count from service:", attData.length);
}

main().catch(console.error);
