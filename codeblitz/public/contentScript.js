(()=>{console.log("CodeBlitz content script loaded \u2705");window.location.hostname.includes("leetcode.com")&&(u(),chrome.runtime&&chrome.runtime.id?(chrome.runtime.onMessage.addListener((r,e,n)=>{try{if(r.type==="GET_LEETCODE_TITLE"){let i=document.querySelector("h1")?.innerText||document.title;n({title:i})}return r.action==="startInterview"&&(l(),n({status:"sidebar_injected"})),!0}catch(t){console.error("Error in message listener:",t);try{n({error:t instanceof Error?t.message:String(t)})}catch(i){console.error("Failed to send error response:",i)}return!1}}),chrome.runtime.onMessageExternal.addListener(()=>{console.log("External message received")})):console.warn("Chrome extension context is invalid or unavailable"));function u(){if(document.getElementById("start-interview-btn"))return;let r=document.createElement("button");r.id="start-interview-btn",r.textContent="\u{1F9E0} Start AI Interview",r.style.cssText=`
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
  `,r.addEventListener("click",()=>{console.log("Interview button clicked");try{chrome.runtime&&chrome.runtime.id?l():(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){console.error("Error starting interview:",e),alert("Error starting interview. Please refresh the page and try again.")}}),document.body.appendChild(r)}function l(){if(document.getElementById("leetcode-ai-sidebar"))return;let r=document.createElement("div");r.id="leetcode-ai-sidebar",r.style.cssText=`
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
    font-family: sans-serif;
  `,r.innerHTML=`
    <div style="padding: 1rem; border-bottom: 1px solid #333; display: flex; justify-content: space-between;">
      <h3>LeetCode AI Interview</h3>
      <button id="exit-interview" style="background: none; color: white;">\u2716</button>
    </div>
    <div id="chat-container" style="flex: 1; overflow-y: auto; padding: 1rem;">
      <div><strong>Leeco:</strong> \u{1F44B} Alright, let's get started!<br/>
      Here's your LeetCode interview question:<br/>
      <em>${h()}</em><br/><br/>
      How would you like to begin?</div>
    </div>
    <div style="padding: 1rem; display: flex; gap: 10px; flex-wrap: wrap;">
      <button id="explain-btn">\u{1F50D} Explain problem</button>
      <button id="example-btn">\u{1F4A1} Need an example</button>
      <button id="skip-btn">\u{1F4AC} I already know</button>
    </div>
  `,document.body.appendChild(r),document.getElementById("exit-interview")?.addEventListener("click",()=>{r.remove()}),document.getElementById("explain-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?d("Can you explain the problem in simple terms?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){console.error("Error sending AI query:",e);let n=document.getElementById("chat-container");if(n){let t=document.createElement("div");t.innerHTML="<strong>Error:</strong> Failed to send message. Please refresh the page.",t.style.color="red",n.appendChild(t)}}}),document.getElementById("example-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?d("Can you give an example input/output for this problem?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){console.error("Error sending AI query:",e);let n=document.getElementById("chat-container");if(n){let t=document.createElement("div");t.innerHTML="<strong>Error:</strong> Failed to send message. Please refresh the page.",t.style.color="red",n.appendChild(t)}}}),document.getElementById("skip-btn")?.addEventListener("click",()=>{try{chrome.runtime&&chrome.runtime.id?d("I know the problem. Can we go to implementation tips?"):(console.error("Extension context invalidated. Please refresh the page."),alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue."))}catch(e){console.error("Error sending AI query:",e);let n=document.getElementById("chat-container");if(n){let t=document.createElement("div");t.innerHTML="<strong>Error:</strong> Failed to send message. Please refresh the page.",t.style.color="red",n.appendChild(t)}}})}function h(){let r=document.querySelector(".description")||document.querySelector('[data-track-load="description_content"]');if(!r)return"Sorry, I couldn't find the problem statement.";let e=r.textContent?.trim();return!e||e.length<10?"The problem statement is empty or not loaded yet.":e.split(`
`)[0]}function d(r){let e=document.getElementById("chat-container");if(!e)return;let n=document.createElement("div");n.innerHTML=`<strong>You:</strong> ${r}`,e.appendChild(n);let t=document.createElement("div");if(t.innerHTML="<em>Leeco is thinking...</em>",t.id="loading-indicator",e.appendChild(t),!chrome.runtime||!chrome.runtime.id){c("Extension context invalidated. Please refresh the page.",e);return}try{let i=new Promise((o,s)=>{setTimeout(()=>s(new Error("Request timed out")),3e4)}),m=new Promise(o=>{chrome.runtime.sendMessage({type:"AI_QUERY",message:r},s=>{chrome.runtime.lastError?(console.error("Chrome runtime error:",chrome.runtime.lastError),o({answer:`\u26A0\uFE0F Error: ${chrome.runtime.lastError.message}`})):o(s)})});Promise.race([m,i]).then(o=>{let s=document.getElementById("loading-indicator");s&&s.remove();let a=document.createElement("div");!o||!o.answer?(a.innerHTML="<strong>Leeco:</strong> \u26A0\uFE0F Sorry, no reply received. Check background script/API key.",a.style.color="orange"):a.innerHTML=`<strong>Leeco:</strong> ${o.answer}`,e.appendChild(a),e.scrollTop=e.scrollHeight}).catch(o=>{c(o instanceof Error?o.message:String(o),e)})}catch(i){c(`Unexpected error: ${i instanceof Error?i.message:String(i)}`,e)}}function c(r,e){console.error(r);let n=document.getElementById("loading-indicator");n&&n.remove();let t=document.createElement("div");t.innerHTML=`<strong>Leeco:</strong> \u26A0\uFE0F ${r}`,t.style.color="orange",e.appendChild(t),e.scrollTop=e.scrollHeight}})();
