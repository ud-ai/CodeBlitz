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

        if (request.action === "startInterview") {
          injectSidebar();
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

function injectSidebar() {
  if (document.getElementById("leetcode-ai-sidebar")) return;

  const sidebar = document.createElement("div");
  sidebar.id = "leetcode-ai-sidebar";
  sidebar.style.cssText = `
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
  `;

  sidebar.innerHTML = `
    <div style="padding: 1rem; border-bottom: 1px solid #333; display: flex; justify-content: space-between;">
      <h3>LeetCode AI Interview</h3>
      <button id="exit-interview" style="background: none; color: white;">✖</button>
    </div>
    <div id="chat-container" style="flex: 1; overflow-y: auto; padding: 1rem;">
      <div><strong>Leeco:</strong> 👋 Alright, let's get started!<br/>
      Here's your LeetCode interview question:<br/>
      <em>${extractProblemStatement()}</em><br/><br/>
      How would you like to begin?</div>
    </div>
    <div style="padding: 1rem; display: flex; gap: 10px; flex-wrap: wrap;">
      <button id="explain-btn">🔍 Explain problem</button>
      <button id="example-btn">💡 Need an example</button>
      <button id="skip-btn">💬 I already know</button>
    </div>
  `;

  document.body.appendChild(sidebar);

  document.getElementById("exit-interview")?.addEventListener("click", () => {
    sidebar.remove();
  });

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
      console.error("Error sending AI query:", error);
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        const errorDiv = document.createElement("div");
        errorDiv.innerHTML = `<strong>Error:</strong> Failed to send message. Please refresh the page.`;
        errorDiv.style.color = "red";
        chatContainer.appendChild(errorDiv);
      }
    }
  });

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
      console.error("Error sending AI query:", error);
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        const errorDiv = document.createElement("div");
        errorDiv.innerHTML = `<strong>Error:</strong> Failed to send message. Please refresh the page.`;
        errorDiv.style.color = "red";
        chatContainer.appendChild(errorDiv);
      }
    }
  });

  document.getElementById("skip-btn")?.addEventListener("click", () => {
    try {
      // Check if extension context is still valid
      if (chrome.runtime && chrome.runtime.id) {
        sendToAI("I know the problem. Can we go to implementation tips?");
      } else {
        console.error("Extension context invalidated. Please refresh the page.");
        alert("CodeBlitz extension context has been invalidated. Please refresh the page to continue.");
      }
    } catch (error) {
      console.error("Error sending AI query:", error);
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        const errorDiv = document.createElement("div");
        errorDiv.innerHTML = `<strong>Error:</strong> Failed to send message. Please refresh the page.`;
        errorDiv.style.color = "red";
        chatContainer.appendChild(errorDiv);
      }
    }
  });
}

function extractProblemStatement(): string {
  const el = document.querySelector('.description') || document.querySelector('[data-track-load="description_content"]');
  if (!el) return "Sorry, I couldn't find the problem statement.";

  const text = el.textContent?.trim();
  if (!text || text.length < 10) return "The problem statement is empty or not loaded yet.";

  return text.split('\n')[0];
}

function sendToAI(userMessage: string) {
  const chatContainer = document.getElementById("chat-container");
  if (!chatContainer) return;

  const userDiv = document.createElement("div");
  userDiv.innerHTML = `<strong>You:</strong> ${userMessage}`;
  chatContainer.appendChild(userDiv);

  const loadingDiv = document.createElement("div");
  loadingDiv.innerHTML = `<em>Leeco is thinking...</em>`;
  loadingDiv.id = "loading-indicator";
  chatContainer.appendChild(loadingDiv);

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

    // Create a promise for the chrome message
    const messagePromise = new Promise<{answer: string}>((resolve) => {
      chrome.runtime.sendMessage({ type: "AI_QUERY", message: userMessage }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          resolve({ answer: `⚠️ Error: ${chrome.runtime.lastError.message}` });
        } else {
          resolve(response);
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

        const aiDiv = document.createElement("div");
        if (!response || !response.answer) {
          aiDiv.innerHTML = `<strong>Leeco:</strong> ⚠️ Sorry, no reply received. Check background script/API key.`;
          aiDiv.style.color = "orange";
        } else {
          aiDiv.innerHTML = `<strong>Leeco:</strong> ${response.answer}`;
        }

        chatContainer.appendChild(aiDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      })
      .catch((error) => {
        handleError(error instanceof Error ? error.message : String(error), chatContainer);
      });
  } catch (error) {
    handleError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`, chatContainer);
  }
}

// Helper function to handle errors in the UI
function handleError(errorMessage: string, container: HTMLElement) {
  console.error(errorMessage);
  
  // Remove loading indicator if it exists
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
  
  // Add error message to chat
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `<strong>Leeco:</strong> ⚠️ ${errorMessage}`;
  errorDiv.style.color = "orange";
  container.appendChild(errorDiv);
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}
