console.log("CodeBlitz content script loaded ✅");

if (window.location.hostname.includes("leetcode.com")) {
  addTriggerButton();

  // Check if extension context is valid before setting up listeners
  if (chrome.runtime && chrome.runtime.id) {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      try {
        if (request.type === "GET_LEETCODE_TITLE") {
          const titleElement = document.querySelector("h1");
          const titleText = titleElement?.innerText || document.title;
          sendResponse({ title: titleText });
        }

        if (request.type === "GET_PROBLEM_DESCRIPTION") {
          const description = extractProblemDescription();
          sendResponse({ description });
        }

        if (request.action === "startInterview") {
          injectSidebar(true);
          sendResponse({ status: "sidebar_injected" });
        }

        return true; // Keep channel open for async response
      } catch (error) {
        console.error("Error in message listener:", error);
        // Try to send an error response if possible
        try {
          sendResponse({ error: error instanceof Error ? error.message : String(error) });
        } catch (sendError) {
          console.error("Failed to send error response:", sendError);
        }
        return false; // Don't keep channel open if there was an error
      }
    });

    // Listen for extension context invalidation
    chrome.runtime.onMessageExternal.addListener(() => {
      console.log("External message received");
    });
  } else {
    console.warn("Chrome extension context is invalid or unavailable");
  }
}

// Conversation persistence helpers
type ConversationMessage = { role: 'user' | 'ai'; content: string };

function getConversationKey(): string {
  return `cb_conversation_${location.hostname}${location.pathname}`;
}

function loadConversation(): Promise<ConversationMessage[]> {
  return new Promise((resolve) => {
    try {
      const key = getConversationKey();
      chrome.storage?.local.get([key], (result) => {
        resolve((result?.[key] as ConversationMessage[]) || []);
      });
    } catch {
      resolve([]);
    }
  });
}

function saveConversation(messages: ConversationMessage[]): Promise<void> {
  return new Promise((resolve) => {
    try {
      const key = getConversationKey();
      chrome.storage?.local.set({ [key]: messages }, () => resolve());
    } catch {
      resolve();
    }
  });
}

// Mode and timer state
type ConversationMode = 'interview' | 'normal'
let currentMode: ConversationMode = 'normal'
let interviewStartMs: number | null = null
let interviewTimerId: number | null = null

function addTriggerButton() {
  if (document.getElementById("start-interview-btn")) return;

  const button = document.createElement("button");
  button.id = "start-interview-btn";
  button.textContent = "🧠 Start AI Interview";
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    z-index: 9999;
  `;

  button.addEventListener("click", () => {
    console.log("Interview button clicked");
    try {
      // Check if extension context is still valid
      if (chrome.runtime && chrome.runtime.id) {
        injectSidebar();
      } else {
        console.error("Extension context invalidated. Please refresh the page.");
        alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue.");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Error starting interview. Please refresh the page and try again.");
    }
  });

  document.body.appendChild(button);
}

function injectSidebar(startInInterview: boolean = false) {
  if (document.getElementById("leetcode-ai-sidebar")) return;

  // Create and inject CSS for the sidebar
  const style = document.createElement('style');
  style.textContent = `
    #leetcode-ai-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: #1e1e2f;
      color: white;
      z-index: 9999;
      box-shadow: -2px 0 10px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      border-left: 1px solid #333;
    }
    
    #leetcode-ai-sidebar .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #7c3aed;
    }
    
    #leetcode-ai-sidebar .sidebar-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    #leetcode-ai-sidebar #exit-interview {
      background: none;
      color: white;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    #leetcode-ai-sidebar #exit-interview:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    #leetcode-ai-sidebar #chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    #leetcode-ai-sidebar .message {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      max-width: 85%;
      line-height: 1.5;
      font-size: 0.95rem;
    }
    
    #leetcode-ai-sidebar .ai-message {
      background-color: #2d2d44;
      align-self: flex-start;
    }
    
    #leetcode-ai-sidebar .user-message {
      background-color: #7c3aed;
      align-self: flex-end;
    }
    
    #leetcode-ai-sidebar .message-sender {
      font-weight: 600;
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }
    
    #leetcode-ai-sidebar .message-content {
      margin: 0;
    }
    
    #leetcode-ai-sidebar .message-content em {
      opacity: 0.8;
    }
    
    #leetcode-ai-sidebar .action-buttons {
      padding: 1rem;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      border-top: 1px solid #333;
      background-color: #252538;
    }
    
    #leetcode-ai-sidebar .action-button {
      background-color: #2d2d44;
      color: white;
      border: 1px solid #3d3d5c;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.2s;
      flex: 1;
      min-width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    #leetcode-ai-sidebar .action-button:hover {
      background-color: #3d3d5c;
    }
    
    #leetcode-ai-sidebar .action-button-icon {
      font-size: 1.1rem;
    }
    
    #leetcode-ai-sidebar .chat-input-container {
      padding: 1rem;
      display: flex;
      gap: 0.5rem;
      border-top: 1px solid #333;
    }
    
    #leetcode-ai-sidebar #chat-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid #3d3d5c;
      background-color: #2d2d44;
      color: white;
      font-family: inherit;
      resize: none;
      outline: none;
    }
    
    #leetcode-ai-sidebar #chat-input:focus {
      border-color: #7c3aed;
    }
    
    #leetcode-ai-sidebar #send-message {
      background-color: #7c3aed;
      color: white;
      border: none;
      border-radius: 8px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    #leetcode-ai-sidebar #send-message:hover {
      background-color: #6d28d9;
    }
  `;
  document.head.appendChild(style);
  // Override and extend styles to match a sleeker UI
  const styleOverrides = document.createElement('style');
  styleOverrides.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    #leetcode-ai-sidebar { background: #0f1220; box-shadow: -6px 0 24px rgba(0,0,0,0.45); border-left: 1px solid rgba(255,255,255,0.06); position: fixed; right: 0; top: 0; --sidebar-min: 320px; --sidebar-max: 780px; }
    #leetcode-ai-sidebar .resize-handle { position: absolute; left: -6px; top: 0; width: 6px; height: 100%; cursor: ew-resize; background: transparent; }
    #leetcode-ai-sidebar .resize-handle:hover { background: rgba(255,255,255,0.08); }
    #leetcode-ai-sidebar.collapsed { width: 56px !important; }
    #leetcode-ai-sidebar.collapsed .hide-when-collapsed { display: none !important; }
    #leetcode-ai-sidebar #cb-expand { display: none; position: absolute; left: -14px; top: 50%; transform: translateY(-50%); background: #7c3aed; border: 1px solid rgba(124,58,237,0.5); color: #fff; border-radius: 14px; width: 28px; height: 56px; cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
    #leetcode-ai-sidebar.collapsed #cb-expand { display: block; }
    #leetcode-ai-sidebar #cb-collapse { background: transparent; border: none; color: #c9c9d1; cursor: pointer; border-radius: 6px; padding: 4px 6px; }
    #leetcode-ai-sidebar #cb-collapse:hover { background: rgba(255,255,255,0.08); color: #fff; }
    #leetcode-ai-sidebar, #leetcode-ai-sidebar * { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    #leetcode-ai-sidebar .status-bar { height: 36px; display:flex; align-items:center; gap:8px; padding:0 12px; background: linear-gradient(180deg, rgba(48,211,122,0.15), rgba(48,211,122,0.06)); border-bottom: 1px solid rgba(48,211,122,0.25); }
    #leetcode-ai-sidebar .status-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #31d17a; box-shadow: 0 0 0 2px rgba(49,209,122,0.25); }
    #leetcode-ai-sidebar .status-spacer { flex: 1; }
    #leetcode-ai-sidebar #status-label { color: #cfeedd; font-weight: 600; font-size: 0.82rem; }
    #leetcode-ai-sidebar #status-timer { color: #bfe7d1; font-size: 0.82rem; }
    #leetcode-ai-sidebar .text-button { background: transparent; color:#c9c9d1; border:none; font-size:0.9rem; padding:4px 8px; cursor:pointer; border-radius:6px; }
    #leetcode-ai-sidebar .text-button:hover { background-color: rgba(255,255,255,0.06); color:#fff; }
    #leetcode-ai-sidebar .sidebar-header { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.06); background:#151933; }
    #leetcode-ai-sidebar .sidebar-header h3 { font-size:0.95rem; color:#e8e8f2; }
    #leetcode-ai-sidebar .chip { border:1px solid rgba(255,255,255,0.12); background-color:rgba(255,255,255,0.04); color:#e8e8f2; border-radius:999px; padding:6px 12px; font-size:0.85rem; cursor:pointer; }
    #leetcode-ai-sidebar .chip.primary { border-color: rgba(124,58,237,0.4); background-color: rgba(124,58,237,0.15); color:#d6c7ff; }
    #leetcode-ai-sidebar #chat-container { padding:12px; gap:12px; }
    #leetcode-ai-sidebar .message { padding:12px 14px; border-radius:16px; max-width:88%; border:1px solid rgba(255,255,255,0.06); box-shadow: 0 2px 10px rgba(0,0,0,0.25); }
    #leetcode-ai-sidebar .ai-message { background-color:#171a2e; }
    #leetcode-ai-sidebar .user-message { background: linear-gradient(180deg, #7c3aed, #6930d8); }
    #leetcode-ai-sidebar .reaction-bar { display:flex; gap:6px; margin-top:6px; opacity:0.85; }
    #leetcode-ai-sidebar .reaction-btn { background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#c9c9d1; border-radius:999px; font-size:0.8rem; padding:4px 8px; cursor:pointer; }
    #leetcode-ai-sidebar .action-buttons { padding:10px 12px; gap:8px; border-top:1px solid rgba(255,255,255,0.06); background:#12162b; }
    #leetcode-ai-sidebar .action-button { background-color: rgba(255,255,255,0.06); color:#e8e8f2; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 12px; }
    #leetcode-ai-sidebar .action-button:hover { background-color: rgba(255,255,255,0.12); }
    #leetcode-ai-sidebar .chat-input-container { padding:12px; display:grid; grid-template-columns:36px 1fr 40px; gap:10px; border-top:1px solid rgba(255,255,255,0.06); align-items:end; background:#0f1220; }
    #leetcode-ai-sidebar #chat-input { padding:12px 14px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); background:#141834; color:#e8e8f2; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04); }
    #leetcode-ai-sidebar #chat-input:focus { border-color: rgba(124,58,237,0.5); }
    #leetcode-ai-sidebar .icon-button { background-color: rgba(124,58,237,0.15); color:#d6c7ff; border:1px solid rgba(124,58,237,0.4); border-radius:10px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    #leetcode-ai-sidebar .subtle { color:#a9a9b8; font-size:0.8rem; }
    /* Markdown & code rendering */
    #leetcode-ai-sidebar .message-content { white-space: pre-wrap; }
    #leetcode-ai-sidebar .message-content code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.92em; }
    #leetcode-ai-sidebar .message-content pre { background:#0c1025; border:1px solid rgba(255,255,255,0.12); padding:12px; border-radius:12px; overflow:auto; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04); }
    #leetcode-ai-sidebar .message-content pre code { background: transparent; padding: 0; display: block; line-height: 1.5; }
    #leetcode-ai-sidebar .message-content ul { margin: 0.25rem 0 0.25rem 1.25rem; padding: 0; }
    #leetcode-ai-sidebar .message-content li { margin: 0.2rem 0; }
  `;
  document.head.appendChild(styleOverrides);

  const sidebar = document.createElement("div");
  sidebar.id = "leetcode-ai-sidebar";

  const problemStatement = extractProblemStatement();
  const problemDescription = extractProblemDescription();

  sidebar.innerHTML = `
    <div id="cb-resize" class="resize-handle" title="Drag to resize"></div>
    <div class="status-bar">
      <span class="status-dot" aria-label="online" title="Online"></span>
      <span id="status-label" class="subtle">Normal</span>
      <span id="status-timer" class="subtle"></span>
      <div class="status-spacer"></div>
      <button id="cb-collapse" class="text-button hide-when-collapsed" title="Collapse">◂</button>
      <button id="end-interview" class="text-button hide-when-collapsed">End Interview</button>
    </div>
    <div class="sidebar-header hide-when-collapsed">
      <h3>Leeco AI • Learning Companion for LeetCode & YouTube</h3>
      <button id="restart-interview" class="chip primary">Start Interview</button>
    </div>
    <div id="chat-container" class="hide-when-collapsed">
      <div class="message ai-message">
        <div class="message-sender">Leeco</div>
        <p class="message-content">👋 Awesome, let's kick things off! You're on the "${problemStatement}" LeetCode problem. In short, could you summarize what you think the problem is asking for in your own words? Or pick one of the options below!</p>
        <div class="reaction-bar">
          <button class="reaction-btn" title="Like">👍</button>
          <button class="reaction-btn" title="Insightful">💡</button>
          <button class="reaction-btn" title="Repeat">🔁</button>
        </div>
      </div>
      <div class="message user-message" id="voice-hint" style="display:none">
        <div class="message-sender">You</div>
        <p class="message-content">🎤 Listening...</p>
      </div>
    </div>
    <div class="action-buttons hide-when-collapsed">
      <button id="explain-btn" class="action-button">
        <span class="action-button-icon">🔍</span> Explain in 1 sentence
      </button>
      <button id="example-btn" class="action-button">
        <span class="action-button-icon">💡</span> Need example
      </button>
      <button id="hint-btn" class="action-button">
        <span class="action-button-icon">🧩</span> Stuck on terminology
      </button>
      <button id="speak-btn" class="action-button">
        <span class="action-button-icon">🎙️</span> Speak your answer
      </button>
    </div>
    <div class="chat-input-container hide-when-collapsed">
      <button id="mic-button" class="icon-button" title="Speak">🎤</button>
      <textarea id="chat-input" placeholder="Type your message here..." rows="1"></textarea>
      <button id="send-message" class="icon-button" title="Send">➤</button>
    </div>
    <button id="cb-expand" title="Expand">▸</button>
  `;

  document.body.appendChild(sidebar);

  // Mode + timer controls
  const labelEl = document.getElementById('status-label');
  const timerEl = document.getElementById('status-timer');

  function updateTimer() {
    if (!timerEl || interviewStartMs == null) return;
    const elapsed = Date.now() - interviewStartMs;
    const pad = (n: number) => String(n).padStart(2, '0');
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    timerEl.textContent = `${h > 0 ? pad(h) + ':' : ''}${pad(m)}:${pad(s)}`;
  }

  function startInterviewMode() {
    currentMode = 'interview';
    if (labelEl) labelEl.textContent = 'Interview';
    interviewStartMs = Date.now();
    updateTimer();
    if (interviewTimerId) window.clearInterval(interviewTimerId);
    interviewTimerId = window.setInterval(updateTimer, 1000);
    try { const k = `cb_mode_${location.hostname}`; chrome.storage?.local.set({ [k]: currentMode }); } catch {}
  }

  function endInterviewMode() {
    currentMode = 'normal';
    if (labelEl) labelEl.textContent = 'Normal';
    interviewStartMs = null;
    if (timerEl) timerEl.textContent = '';
    if (interviewTimerId) { window.clearInterval(interviewTimerId); interviewTimerId = null; }
    try { const k = `cb_mode_${location.hostname}`; chrome.storage?.local.set({ [k]: currentMode }); } catch {}
  }

  document.getElementById('end-interview')?.addEventListener('click', endInterviewMode);

  // Restore width/collapsed state
  try {
    const widthKey = `cb_sidebar_width_${location.hostname}`;
    const collapsedKey = `cb_sidebar_collapsed_${location.hostname}`;
    chrome.storage?.local.get([widthKey, collapsedKey], (res) => {
      const w = res?.[widthKey];
      const c = res?.[collapsedKey];
      if (typeof w === 'number') sidebar.style.width = `${Math.min(Math.max(w, 320), 780)}px`;
      if (c === true) sidebar.classList.add('collapsed');
    });
  } catch {}

  // Collapsing/expanding
  const collapseBtn = document.getElementById('cb-collapse');
  const expandBtn = document.getElementById('cb-expand');
  collapseBtn?.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    try { const k = `cb_sidebar_collapsed_${location.hostname}`; chrome.storage?.local.set({ [k]: true }); } catch {}
  });
  expandBtn?.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    try { const k = `cb_sidebar_collapsed_${location.hostname}`; chrome.storage?.local.set({ [k]: false }); } catch {}
  });

  // Resizing
  const handle = document.getElementById('cb-resize');
  let isDragging = false;
  function onMove(e: MouseEvent) {
    if (!isDragging) return;
    const viewportWidth = window.innerWidth;
    const mouseX = e.clientX;
    const newWidth = Math.min(Math.max(viewportWidth - mouseX, 320), 780);
    sidebar.style.width = `${newWidth}px`;
  }
  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    // Persist width
    const width = parseInt(getComputedStyle(sidebar).width, 10);
    try { const k = `cb_sidebar_width_${location.hostname}`; chrome.storage?.local.set({ [k]: width }); } catch {}
  }
  handle?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Restore persisted UI state
  try {
    const modeKey = `cb_mode_${location.hostname}`;
    chrome.storage?.local.get([modeKey], (res) => {
      const m = res?.[modeKey] as ConversationMode | undefined;
      if (m === 'interview') startInterviewMode();
      else endInterviewMode();
    });
  } catch {}

  // Restore past conversation
  const chatContainerEl = document.getElementById("chat-container");
  loadConversation().then((messages) => {
    if (!chatContainerEl || messages.length === 0) return;
    messages.forEach((m) => {
      const div = document.createElement('div');
      div.className = `message ${m.role === 'ai' ? 'ai-message' : 'user-message'}`;
      div.innerHTML = `
        <div class="message-sender">${m.role === 'ai' ? 'Leeco' : 'You'}</div>
        <p class="message-content">${m.content}</p>
      `;
      chatContainerEl.appendChild(div);
    });
    chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
  });

  // Speech-to-text (Web Speech API) fallback to hint when unavailable
  function startSpeechToText() {
    const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement | null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const showHint = () => {
      const hint = document.getElementById('voice-hint');
      if (!hint) return;
      hint.style.display = 'block';
      setTimeout(() => { if (hint) hint.style.display = 'none'; }, 1600);
    };
    if (!SpeechRecognition || !chatInput) {
      showHint();
      return;
    }
    try {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'en-US';
      showHint();
      recog.onresult = (e: any) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        chatInput.value = text;
        chatInput.dispatchEvent(new Event('input'));
      };
      recog.onerror = () => {};
      recog.onend = () => {};
      recog.start();
    } catch {
      showHint();
    }
  }
  document.getElementById('mic-button')?.addEventListener('click', startSpeechToText);
  document.getElementById('speak-btn')?.addEventListener('click', startSpeechToText);

  // Start interview if requested
  if (startInInterview) startInterviewMode();

  // Handle the explain button click
  document.getElementById("explain-btn")?.addEventListener("click", () => {
    try {
      // Check if extension context is still valid
      if (chrome.runtime && chrome.runtime.id) {
        sendToAI("Can you explain the problem in simple terms?");
      } else {
        console.error("Extension context invalidated. Please refresh the page.");
        alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue.");
      }
    } catch (error) {
      handleError(`Error sending AI query: ${error instanceof Error ? error.message : String(error)}`, document.getElementById("chat-container"));
    }
  });

  // Handle the example button click
  document.getElementById("example-btn")?.addEventListener("click", () => {
    try {
      // Check if extension context is still valid
      if (chrome.runtime && chrome.runtime.id) {
        sendToAI("Can you give an example input/output for this problem?");
      } else {
        console.error("Extension context invalidated. Please refresh the page.");
        alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue.");
      }
    } catch (error) {
      handleError(`Error sending AI query: ${error instanceof Error ? error.message : String(error)}`, document.getElementById("chat-container"));
    }
  });

  // Handle the hint button click
  document.getElementById("hint-btn")?.addEventListener("click", () => {
    try {
      // Check if extension context is still valid
      if (chrome.runtime && chrome.runtime.id) {
        sendToAI("I'm stuck on the terminology. Can you explain the key terms in this problem?");
      } else {
        console.error("Extension context invalidated. Please refresh the page.");
        alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue.");
      }
    } catch (error) {
      handleError(`Error sending AI query: ${error instanceof Error ? error.message : String(error)}`, document.getElementById("chat-container"));
    }
  });

  // Handle the send message button click
  document.getElementById("send-message")?.addEventListener("click", () => {
    const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
    if (chatInput && chatInput.value.trim()) {
      try {
        // Check if extension context is still valid
        if (chrome.runtime && chrome.runtime.id) {
          sendToAI(chatInput.value.trim());
          chatInput.value = ""; // Clear the input after sending
        } else {
          console.error("Extension context invalidated. Please refresh the page.");
          alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue.");
        }
      } catch (error) {
        handleError(`Error sending AI query: ${error instanceof Error ? error.message : String(error)}`, document.getElementById("chat-container"));
      }
    }
  });

  // Handle pressing Enter in the chat input
  document.getElementById("chat-input")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default to avoid newline
      document.getElementById("send-message")?.click();
    }
  });

  // Auto-resize the textarea as the user types
  document.getElementById("chat-input")?.addEventListener("input", (event) => {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`; // Limit max height
  });
}

function extractProblemStatement(): string {
  const el = document.querySelector('.description') || document.querySelector('[data-track-load="description_content"]');
  if (!el) return "Sorry, I couldn't find the problem statement.";

  const text = el.textContent?.trim();
  if (!text || text.length < 10) return "The problem statement is empty or not loaded yet.";

  return text.split('\n')[0];
}

function extractProblemDescription(): string {
  // Try to get the problem description from different possible selectors
  const descriptionElement = 
    document.querySelector('.description') || 
    document.querySelector('[data-track-load="description_content"]') ||
    document.querySelector('.content__u3I1') ||
    document.querySelector('.question-content');
  
  if (!descriptionElement) return "Sorry, I couldn't find the problem description.";
  
  // Get the full text content
  const fullText = descriptionElement.textContent?.trim() || "";
  if (!fullText || fullText.length < 10) return "The problem description is empty or not loaded yet.";
  
  // Try to get examples section too
  const examplesSection = document.querySelectorAll('.example');
  let examplesText = "";
  
  if (examplesSection && examplesSection.length > 0) {
    examplesSection.forEach((example, index) => {
      examplesText += `\n\nExample ${index + 1}:\n${example.textContent?.trim()}`;
    });
  }
  
  // Get difficulty level if available
  const difficultyElement = document.querySelector('.difficulty-label') || document.querySelector('.css-10o4wqw');
  const difficulty = difficultyElement ? `Difficulty: ${difficultyElement.textContent?.trim()}\n\n` : "";
  
  return difficulty + fullText + examplesText;
}

function sendToAI(userMessage: string) {
  const chatContainer = document.getElementById("chat-container");
  if (!chatContainer) return;

  // Add user message to the chat
  const userMessageElement = document.createElement("div");
  userMessageElement.className = "message user-message";
  userMessageElement.innerHTML = `
    <div class="message-sender">You</div>
    <p class="message-content">${userMessage}</p>
  `;
  chatContainer.appendChild(userMessageElement);
  // Persist user message
  loadConversation().then((msgs) => saveConversation([...msgs, { role: 'user', content: userMessage }])).catch(() => {});

  // Add loading indicator
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message ai-message";
  loadingDiv.id = "loading-indicator";
  loadingDiv.innerHTML = `
    <div class="message-sender">Leeco</div>
    <p class="message-content"><em>Thinking...</em></p>
  `;
  chatContainer.appendChild(loadingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Check if extension context is valid
  if (!chrome.runtime || !chrome.runtime.id) {
    handleError("Extension context invalidated. Please refresh the page.", chatContainer);
    return;
  }

  try {
    // Use a timeout to ensure the message doesn't hang indefinitely
    const timeoutPromise = new Promise<{answer: string}>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 30000); // 30 second timeout
    });

    // Get the problem description to provide context
    const problemDescription = extractProblemDescription();

    // Create a promise for the chrome message
    const messagePromise = new Promise<{answer: string}>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: "AI_QUERY", 
        message: userMessage,
        problemStatement: problemDescription,
        mode: currentMode
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          resolve({ answer: `⚠️ Error: ${chrome.runtime.lastError.message}` });
        } else {
          // Fallback if extension can't access service worker response
          if (!response) {
            resolve({ answer: '⚠️ No response from background. Ensure extension is reloaded and API key is set.' });
          } else {
            resolve(response);
          }
        }
      });
    });

    // Race the timeout against the actual message
    Promise.race([messagePromise, timeoutPromise])
      .then((response) => {
        const loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) {
          loadingIndicator.remove();
        }

        const aiMessageElement = document.createElement("div");
        aiMessageElement.className = "message ai-message";
        
        if (!response || !response.answer) {
          aiMessageElement.innerHTML = `
            <div class="message-sender">Leeco</div>
            <p class="message-content">⚠️ Sorry, no reply received. Check background script/API key.</p>
          `;
        } else {
          // Render Markdown-like code blocks if any
          const safe = (response.answer as string)
            .replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
              const l = String(lang || '').toLowerCase();
              const escaped = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              return `<pre><code class="language-${l}">${escaped}</code></pre>`;
            })
            .replace(/`([^`]+)`/g, (_m, inline) => `<code>${String(inline).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`);
          aiMessageElement.innerHTML = `
            <div class="message-sender">Leeco</div>
            <div class="message-content">${safe}</div>
          `;
        }

        chatContainer.appendChild(aiMessageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        // Persist AI message
        loadConversation().then((msgs) => saveConversation([...msgs, { role: 'ai', content: (response as any)?.answer || '' }])).catch(() => {});
      })
      .catch((error) => {
        handleError(error instanceof Error ? error.message : String(error), chatContainer);
      });
  } catch (error) {
    handleError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`, chatContainer);
  }
}

// Helper function to handle errors in the UI
function handleError(errorMessage: string, container: HTMLElement | null) {
  console.error(errorMessage);
  
  if (!container) return;
  
  // Remove loading indicator if it exists
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
  
  // Add error message to chat
  const errorDiv = document.createElement("div");
  errorDiv.className = "message ai-message";
  errorDiv.innerHTML = `
    <div class="message-sender">Leeco</div>
    <p class="message-content">⚠️ ${errorMessage}</p>
  `;
  container.appendChild(errorDiv);
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}
