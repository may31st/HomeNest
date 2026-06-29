async function runTests() {
  const queries = [
    "xin chào",
    "quy trình đăng tin",
    "tìm phòng trọ ở gần cầu giấy",
    "tìm phòng trọ ở gần đại học bách khoa dưới 5 triệu",
    "tìm phòng trọ ở gần 54 triều khúc dưới 4 triệu"
  ];

  for (const query of queries) {
    console.log(`\n========================================`);
    console.log(`Testing Query: "${query}"`);
    console.log(`========================================`);
    try {
      const response = await fetch("http://localhost:8000/api/v1/chatbot/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Bot Response:\n", data.response);
    } catch (e) {
      console.error("Test Error:", e.message);
    }
  }
}

runTests();
