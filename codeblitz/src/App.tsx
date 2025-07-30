import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [leetcodeTitle, setLeetcodeTitle] = useState<string | null>(null);

  useEffect(() => {
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id && activeTab.url?.includes("leetcode.com")) {
        // Send a message to the content script
        chrome.tabs.sendMessage(
          activeTab.id,
          { type: "GET_LEETCODE_TITLE" },
          (response) => {
            if (chrome.runtime.lastError) {
              setLeetcodeTitle("Unable to fetch title.");
              return;
            }
            setLeetcodeTitle(response?.title || "No title found");
          }
        );
      }
    });
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 CodeBlitz</h1>
        <p className="tagline">Your AI assistant for LeetCode & YouTube</p>
      </header>

      <main className="main">
        {leetcodeTitle ? (
          <div className="leetcode-title">
            <h3>📘 Current Problem:</h3>
            <p>{leetcodeTitle}</p>
          </div>
        ) : (
          <>
            <ul>
              <li>✅ AI Hints for LeetCode</li>
              <li>🎯 Video Summaries & Highlights</li>
              <li>💬 Mock Interview Simulations</li>
              <li>📊 Personalized Learning Paths</li>
            </ul>

            <div className="cta">
              <p>Visit a supported site to get started:</p>
              <ul>
                <li><a href="https://leetcode.com" target="_blank">LeetCode</a></li>
                <li><a href="https://youtube.com" target="_blank">YouTube</a></li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
