async function main() {
  const url = 'http://localhost:4004/api/student/dashboard/d4252599-1ae6-4bb7-a4ee-1821e673bada';
  console.log("Calling student dashboard endpoint:", url);
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log("Response:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

main().catch(console.error);
