// ttsforfree.js
export async function ttsForFree(text, voiceId, apiKey, {
  baseUrl = "https://api.ttsforfree.com",
  pitch = 0,
  maxWaitMs = 60_000,
  intervalMs = 1500
} = {}) {
  const createRes = await fetch(`${baseUrl}/api/tts/createby`, {
    method: "POST",
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ Texts: text, Voice: voiceId, Pitch: pitch, ConnectionId: "", CallbackUrl: "" })
  });
  const created = await createRes.json();
  if (!createRes.ok || !created?.Id) throw new Error(created?.Message || `Create failed: ${createRes.status}`);

  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const stRes = await fetch(`${baseUrl}/api/tts/status/${created.Id}`, { headers: { "X-API-Key": apiKey } });
    const st = await stRes.json();
    if (!stRes.ok) throw new Error(st?.Message || `Status failed: ${stRes.status}`);
    if (st.Status === "SUCCESS" && st.Data)
      return st.Data;
    if (st.Status === "ERROR") throw new Error(st.Message || "TTS failed");
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error("Timeout waiting for job");
}

// Example (browser):
// import { ttsForFree } from "/examples/ttsforfree.js";
// const url = await ttsForFree("hello", "v1:xxx", "YOUR_API_KEY");
// new Audio(url).play();