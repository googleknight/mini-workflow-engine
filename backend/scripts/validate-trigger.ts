import axios from "axios";

const API_URL = "http://localhost:4000";

async function testTrigger() {
  try {
    // 1. Create a Workflow
    console.log("Creating workflow...");
    const createRes = await axios.post(`${API_URL}/workflows`, {
      name: "Test Trigger Workflow",
      enabled: true,
      steps: [
        {
          type: "filter",
          conditions: [{ path: "value", op: "eq", value: 100 }],
        },
        {
          type: "transform",
          ops: [
            { op: "template", to: "message", template: "Value is {{value}}" },
          ],
        },
        // Using a httpbin to echo back
        {
          type: "http_request",
          method: "POST",
          url: "https://httpbin.org/post",
          headers: { "Content-Type": "application/json" },
          body: {
            mode: "custom",
            value: {
              nestedInfo: "{{message}}",
            },
          },
          timeoutMs: 5000,
          retries: 2,
        },
      ],
    });

    const workflow = createRes.data;
    console.log("Workflow created:", workflow.id, workflow.triggerPath);

    // 2. Trigger Success
    console.log("\nTriggering (Success Case)...");
    const triggerUrl = `${API_URL}/t/${workflow.triggerPath}`;
    const successRes = await axios.post(triggerUrl, { value: 100 });
    console.log("Success Response:", successRes.data);

    // 3. Trigger Skipped
    console.log("\nTriggering (Skipped Case)...");
    const skippedRes = await axios.post(triggerUrl, { value: 99 });
    console.log("Skipped Response:", skippedRes.data);
  } catch (e: any) {
    console.error("Test failed:", e.message);
    if (e.response) {
      console.error("Response:", e.response.data);
    }
  }
}

testTrigger();
