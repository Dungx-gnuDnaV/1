import assert from "node:assert";
import test from "node:test";
import { POST } from "./route";

test("POST returns generic error response when exception is thrown", async () => {
  // Create a mock Request with invalid JSON body to force JSON parse error in POST handler
  const req = new Request("http://localhost/api/conduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "invalid-json{",
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 500);

  const data = await res.json();
  assert.strictEqual(data.error, "Không thể ghi nhận thi đua");
});
