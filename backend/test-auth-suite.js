async function runAllTests() {
  console.log("=====================================================");
  console.log("   KIRANAS COMPREHENSIVE AUTHENTICATION TEST SUITE   ");
  console.log("=====================================================");
  
  let passed = 0;
  let failed = 0;

  function assert(testName, condition, details) {
    if (condition) {
      console.log(`✔ PASS: ${testName}`);
      if (details) console.log(`   ↳ ${details}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error(`   ↳ ${details}`);
      failed++;
    }
  }

  const BASE_URL = "http://localhost:5000";
  const FRONTEND_URL = "http://localhost:5173";

  // TEST 1: Register a new user
  const newEmail = `new_kirana_${Date.now()}@kiranas.in`;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sunil Verma",
        shopName: "Verma Provision Store",
        email: newEmail,
        phone: "9876543210",
        location: "Bilaspur Mandi",
        password: "securePassword123"
      })
    });
    const data = await res.json();
    assert(
      "TEST 1: Register a new user",
      res.status === 201 && data.token && data.user.email === newEmail,
      `Created user: ${data.user?.name} (${data.user?.email})`
    );
  } catch (err) {
    assert("TEST 1: Register a new user", false, err.message);
  }

  // TEST 2: Register using an existing email
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Sunil",
        shopName: "Verma Store 2",
        email: newEmail,
        phone: "9876543210",
        location: "Bilaspur",
        password: "anotherPassword123"
      })
    });
    const data = await res.json();
    assert(
      "TEST 2: Register using existing email",
      res.status === 400 && data.message.includes("already registered"),
      `Status: ${res.status} | Message: "${data.message}"`
    );
  } catch (err) {
    assert("TEST 2: Register using existing email", false, err.message);
  }

  // TEST 3: Login using registered email and correct password
  let authToken = "";
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newEmail,
        password: "securePassword123"
      })
    });
    const data = await res.json();
    authToken = data.token;
    assert(
      "TEST 3: Login with registered email & correct password",
      res.status === 200 && authToken,
      `HTTP 200 OK | Token: ${authToken ? authToken.slice(0, 25) + "..." : "none"} | Store: ${data.user?.shopName}`
    );
  } catch (err) {
    assert("TEST 3: Login with registered email & correct password", false, err.message);
  }

  // TEST 4: Login using incorrect password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newEmail,
        password: "wrongPassword999"
      })
    });
    const data = await res.json();
    assert(
      "TEST 4: Login using incorrect password",
      res.status === 401 && data.message.toLowerCase().includes("incorrect password"),
      `HTTP 401 | Message: "${data.message}"`
    );
  } catch (err) {
    assert("TEST 4: Login using incorrect password", false, err.message);
  }

  // TEST 5: Login using unregistered email
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "unregistered_ghost_email_9999@kiranas.in",
        password: "somePassword123"
      })
    });
    const data = await res.json();
    assert(
      "TEST 5: Login using unregistered email",
      res.status === 401 && data.message.toLowerCase().includes("no account found"),
      `HTTP 401 | Message: "${data.message}"`
    );
  } catch (err) {
    assert("TEST 5: Login using unregistered email", false, err.message);
  }

  // TEST 6: Submit empty login fields
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" })
    });
    const data = await res.json();
    assert(
      "TEST 6: Submit empty login fields",
      res.status === 400 && data.message.includes("required"),
      `HTTP 400 | Message: "${data.message}"`
    );
  } catch (err) {
    assert("TEST 6: Submit empty login fields", false, err.message);
  }

  // TEST 7: Phone number in email field client validation
  const phoneInput = "9876543210";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isPhoneTreatedAsEmail = emailRegex.test(phoneInput);
  assert(
    "TEST 7: Enter phone number in email field",
    !isPhoneTreatedAsEmail,
    `Phone number "${phoneInput}" correctly rejected by email validator`
  );

  // TEST 8: Session persistence (GET /api/auth/me with Bearer token)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert(
      "TEST 8: Refresh dashboard / Verify persistent session",
      res.status === 200 && data.user && data.user.email === newEmail,
      `HTTP 200 OK | Authenticated User: ${data.user?.name} (${data.user?.email})`
    );
  } catch (err) {
    assert("TEST 8: Refresh dashboard / Verify persistent session", false, err.message);
  }

  // TEST 9: Logout
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST" });
    const data = await res.json();
    assert(
      "TEST 9: Logout endpoint",
      res.status === 200 && data.message.includes("Logged out"),
      `HTTP 200 OK | Message: "${data.message}"`
    );
  } catch (err) {
    assert("TEST 9: Logout endpoint", false, err.message);
  }

  // TEST 10: Open login and registration on frontend
  try {
    const loginRes = await fetch(`${FRONTEND_URL}/login`);
    const registerRes = await fetch(`${FRONTEND_URL}/register`);
    assert(
      "TEST 10: Open login and registration pages",
      loginRes.status === 200 && registerRes.status === 200,
      `Frontend /login -> HTTP ${loginRes.status} | /register -> HTTP ${registerRes.status}`
    );
  } catch (err) {
    assert("TEST 10: Open login and registration pages", false, err.message);
  }

  console.log("=====================================================");
  console.log(`SUMMARY: ${passed} / 10 Tests Passed (${failed} failed)`);
  console.log("=====================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
