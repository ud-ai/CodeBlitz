(()=>{console.log("CodeBlitz content script loaded \u2705");window.location.hostname.includes("leetcode.com")&&(A(),chrome.runtime&&chrome.runtime.id?(chrome.runtime.onMessage.addListener((o,t,a)=>{try{if(o.type==="GET_LEETCODE_TITLE"){let d=document.querySelector("h1")?.innerText||document.title;a({title:d})}if(o.type==="GET_PROBLEM_DESCRIPTION"){let n=B();a({description:n})}return o.action==="startInterview"&&(H(!0),a({status:"sidebar_injected"})),!0}catch(n){console.error("Error in message listener:",n);try{a({error:n instanceof Error?n.message:String(n)})}catch(d){console.error("Failed to send error response:",d)}return!1}}),chrome.runtime.onMessageExternal.addListener(()=>{console.log("External message received")})):console.warn("Chrome extension context is invalid or unavailable"));function P(){return`cb_conversation_${location.hostname}${location.pathname}`}function M(){return new Promise(o=>{try{let t=P();chrome.storage?.local.get([t],a=>{o(a?.[t]||[])})}catch{o([])}})}function z(o){return new Promise(t=>{try{let a=P();chrome.storage?.local.set({[a]:o},()=>t())}catch{t()}})}var y="normal",k=null,x=null;function A(){if(document.getElementById("start-interview-btn"))return;let o=document.createElement("button");o.id="start-interview-btn",o.textContent="\u{1F9E0} Start AI Interview",o.style.cssText=`
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
  `,o.addEventListener("click",()=>{console.log("Interview button clicked");try{chrome.runtime&&chrome.runtime.id?H():(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(t){console.error("Error starting interview:",t),alert("Error starting interview. Please refresh the page and try again.")}}),document.body.appendChild(o)}function H(o=!1){if(document.getElementById("leetcode-ai-sidebar"))return;let t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t);let a=document.createElement("style");a.textContent=`
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
  `,document.head.appendChild(a);let n=document.createElement("div");n.id="leetcode-ai-sidebar";let d=q(),C=B();n.innerHTML=`
    <div id="cb-resize" class="resize-handle" title="Drag to resize"></div>
    <div class="status-bar">
      <span class="status-dot" aria-label="online" title="Online"></span>
      <span id="status-label" class="subtle">Normal</span>
      <span id="status-timer" class="subtle"></span>
      <div class="status-spacer"></div>
      <button id="cb-collapse" class="text-button hide-when-collapsed" title="Collapse">\u25C2</button>
      <button id="end-interview" class="text-button hide-when-collapsed">End Interview</button>
    </div>
    <div class="sidebar-header hide-when-collapsed">
      <h3>Leeco AI \u2022 Learning Companion for LeetCode & YouTube</h3>
      <button id="restart-interview" class="chip primary">Start Interview</button>
    </div>
    <div id="chat-container" class="hide-when-collapsed">
      <div class="message ai-message">
        <div class="message-sender">Leeco</div>
        <p class="message-content">\u{1F44B} Awesome, let's kick things off! You're on the "${d}" LeetCode problem. In short, could you summarize what you think the problem is asking for in your own words? Or pick one of the options below!</p>
        <div class="reaction-bar">
          <button class="reaction-btn" title="Like">\u{1F44D}</button>
          <button class="reaction-btn" title="Insightful">\u{1F4A1}</button>
          <button class="reaction-btn" title="Repeat">\u{1F501}</button>
        </div>
      </div>
      <div class="message user-message" id="voice-hint" style="display:none">
        <div class="message-sender">You</div>
        <p class="message-content">\u{1F3A4} Listening...</p>
      </div>
    </div>
    <div class="action-buttons hide-when-collapsed">
      <button id="explain-btn" class="action-button">
        <span class="action-button-icon">\u{1F50D}</span> Explain in 1 sentence
      </button>
      <button id="example-btn" class="action-button">
        <span class="action-button-icon">\u{1F4A1}</span> Need example
      </button>
      <button id="hint-btn" class="action-button">
        <span class="action-button-icon">\u{1F9E9}</span> Stuck on terminology
      </button>
      <button id="speak-btn" class="action-button">
        <span class="action-button-icon">\u{1F399}\uFE0F</span> Speak your answer
      </button>
    </div>
    <div class="chat-input-container hide-when-collapsed">
      <button id="mic-button" class="icon-button" title="Speak">\u{1F3A4}</button>
      <textarea id="chat-input" placeholder="Type your message here..." rows="1"></textarea>
      <button id="send-message" class="icon-button" title="Send">\u27A4</button>
    </div>
    <button id="cb-expand" title="Expand">\u25B8</button>
  `,document.body.appendChild(n);let m=document.getElementById("status-label"),i=document.getElementById("status-timer");function l(){if(!i||k==null)return;let e=Date.now()-k,r=E=>String(E).padStart(2,"0"),c=Math.floor(e/36e5),s=Math.floor(e%36e5/6e4),u=Math.floor(e%6e4/1e3);i.textContent=`${c>0?r(c)+":":""}${r(s)}:${r(u)}`}function p(){y="interview",m&&(m.textContent="Interview"),k=Date.now(),l(),x&&window.clearInterval(x),x=window.setInterval(l,1e3);try{let e=`cb_mode_${location.hostname}`;chrome.storage?.local.set({[e]:y})}catch{}}function g(){y="normal",m&&(m.textContent="Normal"),k=null,i&&(i.textContent=""),x&&(window.clearInterval(x),x=null);try{let e=`cb_mode_${location.hostname}`;chrome.storage?.local.set({[e]:y})}catch{}}document.getElementById("end-interview")?.addEventListener("click",g);try{let e=`cb_sidebar_width_${location.hostname}`,r=`cb_sidebar_collapsed_${location.hostname}`;chrome.storage?.local.get([e,r],c=>{let s=c?.[e],u=c?.[r];typeof s=="number"&&(n.style.width=`${Math.min(Math.max(s,320),780)}px`),u===!0&&n.classList.add("collapsed")})}catch{}let L=document.getElementById("cb-collapse"),f=document.getElementById("cb-expand");L?.addEventListener("click",()=>{n.classList.add("collapsed");try{let e=`cb_sidebar_collapsed_${location.hostname}`;chrome.storage?.local.set({[e]:!0})}catch{}}),f?.addEventListener("click",()=>{n.classList.remove("collapsed");try{let e=`cb_sidebar_collapsed_${location.hostname}`;chrome.storage?.local.set({[e]:!1})}catch{}});let S=document.getElementById("cb-resize"),h=!1;function v(e){if(!h)return;let r=window.innerWidth,c=e.clientX,s=Math.min(Math.max(r-c,320),780);n.style.width=`${s}px`}function _(){if(!h)return;h=!1,document.removeEventListener("mousemove",v),document.removeEventListener("mouseup",_);let e=parseInt(getComputedStyle(n).width,10);try{let r=`cb_sidebar_width_${location.hostname}`;chrome.storage?.local.set({[r]:e})}catch{}}S?.addEventListener("mousedown",e=>{e.preventDefault(),h=!0,document.addEventListener("mousemove",v),document.addEventListener("mouseup",_)});try{let e=`cb_mode_${location.hostname}`;chrome.storage?.local.get([e],r=>{r?.[e]==="interview"?p():g()})}catch{}let w=document.getElementById("chat-container");M().then(e=>{!w||e.length===0||(e.forEach(r=>{let c=document.createElement("div");c.className=`message ${r.role==="ai"?"ai-message":"user-message"}`,c.innerHTML=`
        <div class="message-sender">${r.role==="ai"?"Leeco":"You"}</div>
        <p class="message-content">${r.content}</p>
      `,w.appendChild(c)}),w.scrollTop=w.scrollHeight)});function $(){let e=document.getElementById("chat-input"),r=window.SpeechRecognition||window.webkitSpeechRecognition,c=()=>{let s=document.getElementById("voice-hint");s&&(s.style.display="block",setTimeout(()=>{s&&(s.style.display="none")},1600))};if(!r||!e){c();return}try{let s=new r;s.continuous=!1,s.interimResults=!0,s.lang="en-US",c(),s.onresult=u=>{let E="";for(let T=u.resultIndex;T<u.results.length;T++)E+=u.results[T][0].transcript;e.value=E,e.dispatchEvent(new Event("input"))},s.onerror=()=>{},s.onend=()=>{},s.start()}catch{c()}}document.getElementById("mic-button")?.addEventListener("click",$),document.getElementById("speak-btn")?.addEventListener("click",$),o&&p(),document.getElementById("explain-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?I("Can you explain the problem in simple terms?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){b(`Error sending AI query: ${e instanceof Error?e.message:String(e)}`,document.getElementById("chat-container"))}}),document.getElementById("example-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?I("Can you give an example input/output for this problem?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){b(`Error sending AI query: ${e instanceof Error?e.message:String(e)}`,document.getElementById("chat-container"))}}),document.getElementById("hint-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?I("I'm stuck on the terminology. Can you explain the key terms in this problem?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){b(`Error sending AI query: ${e instanceof Error?e.message:String(e)}`,document.getElementById("chat-container"))}}),document.getElementById("send-message")?.addEventListener("click",()=>{let e=document.getElementById("chat-input");if(e&&e.value.trim())try{chrome.runtime&&chrome.runtime.id?(I(e.value.trim()),e.value=""):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(r){b(`Error sending AI query: ${r instanceof Error?r.message:String(r)}`,document.getElementById("chat-container"))}}),document.getElementById("chat-input")?.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),document.getElementById("send-message")?.click())}),document.getElementById("chat-input")?.addEventListener("input",e=>{let r=e.target;r.style.height="auto",r.style.height=`${Math.min(r.scrollHeight,150)}px`})}function q(){let o=document.querySelector(".description")||document.querySelector('[data-track-load="description_content"]');if(!o)return"Sorry, I couldn't find the problem statement.";let t=o.textContent?.trim();return!t||t.length<10?"The problem statement is empty or not loaded yet.":t.split(`
`)[0]}function B(){let o=document.querySelector(".description")||document.querySelector('[data-track-load="description_content"]')||document.querySelector(".content__u3I1")||document.querySelector(".question-content");if(!o)return"Sorry, I couldn't find the problem description.";let t=o.textContent?.trim()||"";if(!t||t.length<10)return"The problem description is empty or not loaded yet.";let a=document.querySelectorAll(".example"),n="";a&&a.length>0&&a.forEach((m,i)=>{n+=`

Example ${i+1}:
${m.textContent?.trim()}`});let d=document.querySelector(".difficulty-label")||document.querySelector(".css-10o4wqw");return(d?`Difficulty: ${d.textContent?.trim()}

`:"")+t+n}function I(o){let t=document.getElementById("chat-container");if(!t)return;let a=document.createElement("div");a.className="message user-message",a.innerHTML=`
    <div class="message-sender">You</div>
    <p class="message-content">${o}</p>
  `,t.appendChild(a),M().then(d=>z([...d,{role:"user",content:o}])).catch(()=>{});let n=document.createElement("div");if(n.className="message ai-message",n.id="loading-indicator",n.innerHTML=`
    <div class="message-sender">Leeco</div>
    <p class="message-content"><em>Thinking...</em></p>
  `,t.appendChild(n),t.scrollTop=t.scrollHeight,!chrome.runtime||!chrome.runtime.id){b("Extension context invalidated. Please refresh the page.",t);return}try{let d=new Promise((i,l)=>{setTimeout(()=>l(new Error("Request timed out")),3e4)}),C=B(),m=new Promise(i=>{chrome.runtime.sendMessage({type:"AI_QUERY",message:o,problemStatement:C,mode:y},l=>{chrome.runtime.lastError?(console.error("Chrome runtime error:",chrome.runtime.lastError),i({answer:`\u26A0\uFE0F Error: ${chrome.runtime.lastError.message}`})):i(l||{answer:"\u26A0\uFE0F No response from background. Ensure extension is reloaded and API key is set."})})});Promise.race([m,d]).then(i=>{let l=document.getElementById("loading-indicator");l&&l.remove();let p=document.createElement("div");if(p.className="message ai-message",!i||!i.answer)p.innerHTML=`
            <div class="message-sender">Leeco</div>
            <p class="message-content">\u26A0\uFE0F Sorry, no reply received. Check background script/API key.</p>
          `;else{let g=i.answer.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g,(L,f,S)=>{let h=String(f||"").toLowerCase(),v=S.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return`<pre><code class="language-${h}">${v}</code></pre>`}).replace(/`([^`]+)`/g,(L,f)=>`<code>${String(f).replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code>`);p.innerHTML=`
            <div class="message-sender">Leeco</div>
            <div class="message-content">${g}</div>
          `}t.appendChild(p),t.scrollTop=t.scrollHeight,M().then(g=>z([...g,{role:"ai",content:i?.answer||""}])).catch(()=>{})}).catch(i=>{b(i instanceof Error?i.message:String(i),t)})}catch(d){b(`Unexpected error: ${d instanceof Error?d.message:String(d)}`,t)}}function b(o,t){if(console.error(o),!t)return;let a=document.getElementById("loading-indicator");a&&a.remove();let n=document.createElement("div");n.className="message ai-message",n.innerHTML=`
    <div class="message-sender">Leeco</div>
    <p class="message-content">\u26A0\uFE0F ${o}</p>
  `,t.appendChild(n),t.scrollTop=t.scrollHeight}})();
