(()=>{console.log("CodeBlitz content script loaded \u2705");window.location.hostname.includes("leetcode.com")&&(z(),chrome.runtime&&chrome.runtime.id?(chrome.runtime.onMessage.addListener((n,t,o)=>{try{if(n.type==="GET_LEETCODE_TITLE"){let c=document.querySelector("h1")?.innerText||document.title;o({title:c})}if(n.type==="GET_PROBLEM_DESCRIPTION"){let i=w();o({description:i})}return n.action==="startInterview"&&(B(),o({status:"sidebar_injected"})),!0}catch(i){console.error("Error in message listener:",i);try{o({error:i instanceof Error?i.message:String(i)})}catch(c){console.error("Failed to send error response:",c)}return!1}}),chrome.runtime.onMessageExternal.addListener(()=>{console.log("External message received")})):console.warn("Chrome extension context is invalid or unavailable"));function T(){return`cb_conversation_${location.hostname}${location.pathname}`}function E(){return new Promise(n=>{try{let t=T();chrome.storage?.local.get([t],o=>{n(o?.[t]||[])})}catch{n([])}})}function S(n){return new Promise(t=>{try{let o=T();chrome.storage?.local.set({[o]:n},()=>t())}catch{t()}})}function z(){if(document.getElementById("start-interview-btn"))return;let n=document.createElement("button");n.id="start-interview-btn",n.textContent="\u{1F9E0} Start AI Interview",n.style.cssText=`
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
  `,n.addEventListener("click",()=>{console.log("Interview button clicked");try{chrome.runtime&&chrome.runtime.id?B():(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(t){console.error("Error starting interview:",t),alert("Error starting interview. Please refresh the page and try again.")}}),document.body.appendChild(n)}function B(){if(document.getElementById("leetcode-ai-sidebar"))return;let n=document.createElement("style");n.textContent=`
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
  `,document.head.appendChild(n);let t=document.createElement("style");t.textContent=`
    #leetcode-ai-sidebar { background: #0f1220; box-shadow: -6px 0 24px rgba(0,0,0,0.45); border-left: 1px solid rgba(255,255,255,0.06); position: fixed; right: 0; top: 0; --sidebar-min: 320px; --sidebar-max: 780px; }
    #leetcode-ai-sidebar .resize-handle { position: absolute; left: -6px; top: 0; width: 6px; height: 100%; cursor: ew-resize; background: transparent; }
    #leetcode-ai-sidebar .resize-handle:hover { background: rgba(255,255,255,0.08); }
    #leetcode-ai-sidebar.collapsed { width: 56px !important; }
    #leetcode-ai-sidebar.collapsed .hide-when-collapsed { display: none !important; }
    #leetcode-ai-sidebar #cb-expand { display: none; position: absolute; left: -14px; top: 50%; transform: translateY(-50%); background: #7c3aed; border: 1px solid rgba(124,58,237,0.5); color: #fff; border-radius: 14px; width: 28px; height: 56px; cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
    #leetcode-ai-sidebar.collapsed #cb-expand { display: block; }
    #leetcode-ai-sidebar #cb-collapse { background: transparent; border: none; color: #c9c9d1; cursor: pointer; border-radius: 6px; padding: 4px 6px; }
    #leetcode-ai-sidebar #cb-collapse:hover { background: rgba(255,255,255,0.08); color: #fff; }
    #leetcode-ai-sidebar .status-bar { height: 36px; display:flex; align-items:center; gap:8px; padding:0 12px; background: linear-gradient(180deg, rgba(48,211,122,0.15), rgba(48,211,122,0.06)); border-bottom: 1px solid rgba(48,211,122,0.25); }
    #leetcode-ai-sidebar .status-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #31d17a; box-shadow: 0 0 0 2px rgba(49,209,122,0.25); }
    #leetcode-ai-sidebar .status-spacer { flex: 1; }
    #leetcode-ai-sidebar .text-button { background: transparent; color:#c9c9d1; border:none; font-size:0.9rem; padding:4px 8px; cursor:pointer; border-radius:6px; }
    #leetcode-ai-sidebar .text-button:hover { background-color: rgba(255,255,255,0.06); color:#fff; }
    #leetcode-ai-sidebar .sidebar-header { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.06); background:#151933; }
    #leetcode-ai-sidebar .sidebar-header h3 { font-size:0.95rem; color:#e8e8f2; }
    #leetcode-ai-sidebar .chip { border:1px solid rgba(255,255,255,0.12); background-color:rgba(255,255,255,0.04); color:#e8e8f2; border-radius:999px; padding:6px 12px; font-size:0.85rem; cursor:pointer; }
    #leetcode-ai-sidebar .chip.primary { border-color: rgba(124,58,237,0.4); background-color: rgba(124,58,237,0.15); color:#d6c7ff; }
    #leetcode-ai-sidebar #chat-container { padding:12px; gap:12px; }
    #leetcode-ai-sidebar .message { padding:10px 12px; border-radius:12px; max-width:88%; border:1px solid rgba(255,255,255,0.06); }
    #leetcode-ai-sidebar .ai-message { background-color:#171a2e; }
    #leetcode-ai-sidebar .user-message { background: linear-gradient(180deg, #7c3aed, #6930d8); }
    #leetcode-ai-sidebar .reaction-bar { display:flex; gap:6px; margin-top:6px; opacity:0.85; }
    #leetcode-ai-sidebar .reaction-btn { background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#c9c9d1; border-radius:999px; font-size:0.8rem; padding:4px 8px; cursor:pointer; }
    #leetcode-ai-sidebar .action-buttons { padding:10px 12px; gap:8px; border-top:1px solid rgba(255,255,255,0.06); background:#12162b; }
    #leetcode-ai-sidebar .action-button { background-color: rgba(255,255,255,0.06); color:#e8e8f2; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 12px; }
    #leetcode-ai-sidebar .action-button:hover { background-color: rgba(255,255,255,0.12); }
    #leetcode-ai-sidebar .chat-input-container { padding:10px 12px; display:grid; grid-template-columns:36px 1fr 40px; gap:8px; border-top:1px solid rgba(255,255,255,0.06); align-items:end; background:#0f1220; }
    #leetcode-ai-sidebar #chat-input { padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:#141834; color:#e8e8f2; }
    #leetcode-ai-sidebar #chat-input:focus { border-color: rgba(124,58,237,0.5); }
    #leetcode-ai-sidebar .icon-button { background-color: rgba(124,58,237,0.15); color:#d6c7ff; border:1px solid rgba(124,58,237,0.4); border-radius:10px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    #leetcode-ai-sidebar .subtle { color:#a9a9b8; font-size:0.8rem; }
  `,document.head.appendChild(t);let o=document.createElement("div");o.id="leetcode-ai-sidebar";let i=_(),c=w();o.innerHTML=`
    <div id="cb-resize" class="resize-handle" title="Drag to resize"></div>
    <div class="status-bar">
      <span class="status-dot" aria-label="online" title="Online"></span>
      <span id="status-clock" class="subtle"></span>
      <div class="status-spacer"></div>
      <button id="cb-collapse" class="text-button hide-when-collapsed" title="Collapse">\u25C2</button>
      <button id="exit-interview" class="text-button hide-when-collapsed">Exit</button>
    </div>
    <div class="sidebar-header hide-when-collapsed">
      <h3>Leeco AI \u2022 Learning Companion for LeetCode & YouTube</h3>
      <button id="restart-interview" class="chip primary">Start Interview</button>
    </div>
    <div id="chat-container" class="hide-when-collapsed">
      <div class="message ai-message">
        <div class="message-sender">Leeco</div>
        <p class="message-content">\u{1F44B} Awesome, let's kick things off! You're on the "${i}" LeetCode problem. In short, could you summarize what you think the problem is asking for in your own words? Or pick one of the options below!</p>
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
  `,document.body.appendChild(o);let b=document.getElementById("status-clock"),p=()=>{let e=new Date,r=d=>String(d).padStart(2,"0");b&&(b.textContent=`${r(e.getHours())}:${r(e.getMinutes())}`)};p();let s=window.setInterval(p,15e3);document.getElementById("exit-interview")?.addEventListener("click",()=>{clearInterval(s),o.remove()});try{let e=`cb_sidebar_width_${location.hostname}`,r=`cb_sidebar_collapsed_${location.hostname}`;chrome.storage?.local.get([e,r],d=>{let a=d?.[e],g=d?.[r];typeof a=="number"&&(o.style.width=`${Math.min(Math.max(a,320),780)}px`),g===!0&&o.classList.add("collapsed")})}catch{}let l=document.getElementById("cb-collapse"),m=document.getElementById("cb-expand");l?.addEventListener("click",()=>{o.classList.add("collapsed");try{let e=`cb_sidebar_collapsed_${location.hostname}`;chrome.storage?.local.set({[e]:!0})}catch{}}),m?.addEventListener("click",()=>{o.classList.remove("collapsed");try{let e=`cb_sidebar_collapsed_${location.hostname}`;chrome.storage?.local.set({[e]:!1})}catch{}});let y=document.getElementById("cb-resize"),h=!1;function k(e){if(!h)return;let r=window.innerWidth,d=e.clientX,a=Math.min(Math.max(r-d,320),780);o.style.width=`${a}px`}function I(){if(!h)return;h=!1,document.removeEventListener("mousemove",k),document.removeEventListener("mouseup",I);let e=parseInt(getComputedStyle(o).width,10);try{let r=`cb_sidebar_width_${location.hostname}`;chrome.storage?.local.set({[r]:e})}catch{}}y?.addEventListener("mousedown",e=>{e.preventDefault(),h=!0,document.addEventListener("mousemove",k),document.addEventListener("mouseup",I)});let x=document.getElementById("chat-container");E().then(e=>{!x||e.length===0||(e.forEach(r=>{let d=document.createElement("div");d.className=`message ${r.role==="ai"?"ai-message":"user-message"}`,d.innerHTML=`
        <div class="message-sender">${r.role==="ai"?"Leeco":"You"}</div>
        <p class="message-content">${r.content}</p>
      `,x.appendChild(d)}),x.scrollTop=x.scrollHeight)});function L(){let e=document.getElementById("chat-input"),r=window.SpeechRecognition||window.webkitSpeechRecognition,d=()=>{let a=document.getElementById("voice-hint");a&&(a.style.display="block",setTimeout(()=>{a&&(a.style.display="none")},1600))};if(!r||!e){d();return}try{let a=new r;a.continuous=!1,a.interimResults=!0,a.lang="en-US",d(),a.onresult=g=>{let C="";for(let v=g.resultIndex;v<g.results.length;v++)C+=g.results[v][0].transcript;e.value=C,e.dispatchEvent(new Event("input"))},a.onerror=()=>{},a.onend=()=>{},a.start()}catch{d()}}document.getElementById("mic-button")?.addEventListener("click",L),document.getElementById("speak-btn")?.addEventListener("click",L),document.getElementById("explain-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?f("Can you explain the problem in simple terms?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){u(`Error sending AI query: ${e instanceof Error?e.message:String(e)}`,document.getElementById("chat-container"))}}),document.getElementById("example-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?f("Can you give an example input/output for this problem?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){u(`Error sending AI query: ${e instanceof Error?e.message:String(e)}`,document.getElementById("chat-container"))}}),document.getElementById("hint-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?f("I'm stuck on the terminology. Can you explain the key terms in this problem?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){u(`Error sending AI query: ${e instanceof Error?e.message:String(e)}`,document.getElementById("chat-container"))}}),document.getElementById("send-message")?.addEventListener("click",()=>{let e=document.getElementById("chat-input");if(e&&e.value.trim())try{chrome.runtime&&chrome.runtime.id?(f(e.value.trim()),e.value=""):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(r){u(`Error sending AI query: ${r instanceof Error?r.message:String(r)}`,document.getElementById("chat-container"))}}),document.getElementById("chat-input")?.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),document.getElementById("send-message")?.click())}),document.getElementById("chat-input")?.addEventListener("input",e=>{let r=e.target;r.style.height="auto",r.style.height=`${Math.min(r.scrollHeight,150)}px`})}function _(){let n=document.querySelector(".description")||document.querySelector('[data-track-load="description_content"]');if(!n)return"Sorry, I couldn't find the problem statement.";let t=n.textContent?.trim();return!t||t.length<10?"The problem statement is empty or not loaded yet.":t.split(`
`)[0]}function w(){let n=document.querySelector(".description")||document.querySelector('[data-track-load="description_content"]')||document.querySelector(".content__u3I1")||document.querySelector(".question-content");if(!n)return"Sorry, I couldn't find the problem description.";let t=n.textContent?.trim()||"";if(!t||t.length<10)return"The problem description is empty or not loaded yet.";let o=document.querySelectorAll(".example"),i="";o&&o.length>0&&o.forEach((p,s)=>{i+=`

Example ${s+1}:
${p.textContent?.trim()}`});let c=document.querySelector(".difficulty-label")||document.querySelector(".css-10o4wqw");return(c?`Difficulty: ${c.textContent?.trim()}

`:"")+t+i}function f(n){let t=document.getElementById("chat-container");if(!t)return;let o=document.createElement("div");o.className="message user-message",o.innerHTML=`
    <div class="message-sender">You</div>
    <p class="message-content">${n}</p>
  `,t.appendChild(o),E().then(c=>S([...c,{role:"user",content:n}])).catch(()=>{});let i=document.createElement("div");if(i.className="message ai-message",i.id="loading-indicator",i.innerHTML=`
    <div class="message-sender">Leeco</div>
    <p class="message-content"><em>Thinking...</em></p>
  `,t.appendChild(i),t.scrollTop=t.scrollHeight,!chrome.runtime||!chrome.runtime.id){u("Extension context invalidated. Please refresh the page.",t);return}try{let c=new Promise((s,l)=>{setTimeout(()=>l(new Error("Request timed out")),3e4)}),b=w(),p=new Promise(s=>{chrome.runtime.sendMessage({type:"AI_QUERY",message:n,problemStatement:b},l=>{chrome.runtime.lastError?(console.error("Chrome runtime error:",chrome.runtime.lastError),s({answer:`\u26A0\uFE0F Error: ${chrome.runtime.lastError.message}`})):s(l)})});Promise.race([p,c]).then(s=>{let l=document.getElementById("loading-indicator");l&&l.remove();let m=document.createElement("div");m.className="message ai-message",!s||!s.answer?m.innerHTML=`
            <div class="message-sender">Leeco</div>
            <p class="message-content">\u26A0\uFE0F Sorry, no reply received. Check background script/API key.</p>
          `:m.innerHTML=`
            <div class="message-sender">Leeco</div>
            <p class="message-content">${s.answer}</p>
          `,t.appendChild(m),t.scrollTop=t.scrollHeight,E().then(y=>S([...y,{role:"ai",content:s?.answer||""}])).catch(()=>{})}).catch(s=>{u(s instanceof Error?s.message:String(s),t)})}catch(c){u(`Unexpected error: ${c instanceof Error?c.message:String(c)}`,t)}}function u(n,t){if(console.error(n),!t)return;let o=document.getElementById("loading-indicator");o&&o.remove();let i=document.createElement("div");i.className="message ai-message",i.innerHTML=`
    <div class="message-sender">Leeco</div>
    <p class="message-content">\u26A0\uFE0F ${n}</p>
  `,t.appendChild(i),t.scrollTop=t.scrollHeight}})();
