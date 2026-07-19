/* Shared across all pages: the "Ask my AI" assistant.
   ================= CONFIG =================
   After deploying the Lambda (see lambda/ + the setup guide),
   paste its Function URL between the quotes below: */
const AI_ENDPOINT = "https://o27ss6j2rhaf5367dfndjra5wa0rcvdq.lambda-url.us-east-1.on.aws/"; /* e.g. "https://xxxx.lambda-url.us-east-1.on.aws/" */
/* ========================================== */

document.body.insertAdjacentHTML("beforeend", `
<button class="ai-fab" id="aiFab">✦ Ask my AI</button>
<div class="ai-panel" id="aiPanel" role="dialog" aria-label="AI assistant">
  <div class="ai-head">
    <div><h4>✦ Kevin's AI Assistant</h4><p>Powered by AWS Lambda + Amazon Bedrock</p></div>
    <button class="ai-close" id="aiClose" aria-label="Close">×</button>
  </div>
  <div class="ai-body" id="aiBody">
    <div class="ai-msg">Hi! I'm an AI assistant that can summarize Kevin's background for recruiters and hiring managers. Pick a question below. I run on the same AWS and Bedrock stack Kevin builds with.</div>
  </div>
  <div class="ai-prompts" id="aiPrompts">
    <div class="hint">// choose a question</div>
    <button class="ai-prompt" data-id="summary">Give me a quick summary of Kevin's background</button>
    <button class="ai-prompt" data-id="boardroom">Tell me about BoardRoom, his AI market research system</button>
    <button class="ai-prompt" data-id="skills">What AWS and cloud skills does he have?</button>
    <button class="ai-prompt" data-id="why_hire">Why would Kevin be a strong cloud hire?</button>
  </div>
</div>`);

const aiPanel = document.getElementById("aiPanel");
const aiBody = document.getElementById("aiBody");
const answered = new Set();

document.getElementById("aiFab").addEventListener("click", () => aiPanel.classList.toggle("open"));
document.getElementById("aiClose").addEventListener("click", () => aiPanel.classList.remove("open"));
document.querySelectorAll(".btn-ai").forEach(b => b.addEventListener("click", () => aiPanel.classList.add("open")));

function aiMsg(text, who) {
  const d = document.createElement("div");
  d.className = "ai-msg" + (who === "user" ? " user" : "");
  d.textContent = text;
  aiBody.appendChild(d);
  aiBody.scrollTop = aiBody.scrollHeight;
  return d;
}

document.querySelectorAll(".ai-prompt").forEach(btn => btn.addEventListener("click", async () => {
  const id = btn.dataset.id;
  if (answered.has(id)) return;
  answered.add(id);
  btn.disabled = true;
  aiMsg(btn.textContent, "user");

  if (!AI_ENDPOINT) {
    aiMsg("The AI backend isn't connected yet. Check back soon! Meanwhile, everything about Kevin is right here on the site, or grab the resume on the Resume page.");
    return;
  }

  const loading = aiMsg("", "ai");
  loading.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt_id: id })
    });
    const data = await res.json();
    loading.textContent = res.ok && data.answer
      ? data.answer
      : (data.error || "Sorry, the assistant is taking a break. The Resume page has everything!");
  } catch (e) {
    loading.textContent = "Couldn't reach the assistant right now. The Resume page has everything!";
  }
}));
