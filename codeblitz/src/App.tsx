import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useState } from 'react';
import './App.css';

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="error-container">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  const [leetcodeTitle, setLeetcodeTitle] = useState<string | null>(null);
  const [problemDescription, setProblemDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if chrome API is available (will be undefined in dev environment)
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab?.id && activeTab.url?.includes("leetcode.com")) {
            setIsLoading(true);
            // Send a message to the content script
            chrome.tabs.sendMessage(
              activeTab.id,
              { type: "GET_LEETCODE_TITLE" },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error("Error fetching title:", chrome.runtime.lastError);
                  setLeetcodeTitle("Unable to fetch title.");
                  setIsLoading(false);
                  setError(chrome.runtime.lastError.message || "Unknown error");
                  return;
                }
                
                setLeetcodeTitle(response?.title || "No title found");
                
                // Fetch problem description
                chrome.tabs.sendMessage(
                  activeTab.id as number,
                  { type: "GET_PROBLEM_DESCRIPTION" },
                  (descResponse: { description?: string }) => {
                    if (chrome.runtime.lastError) {
                      console.error("Error fetching description:", chrome.runtime.lastError);
                      setProblemDescription("Unable to fetch problem description.");
                      setError(chrome.runtime.lastError.message || "Unknown error");
                    } else {
                      setProblemDescription(descResponse?.description || "No description found");
                      
                      // Generate AI response based on the problem
                      if (descResponse?.description) {
                        generateAiResponse(response?.title || "", descResponse.description);
                        fetchRelatedQuestions(response?.title || "");
                      }
                    }
                    setIsLoading(false);
                  }
                );
              }
            );
          } else {
            // Not on LeetCode
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error("Error in useEffect:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    } else {
      // In development environment, show a placeholder
      setLeetcodeTitle("Development Mode - Chrome API not available");
      setIsLoading(false);
    }
  }, []);

  const generateAiResponse = (title: string, description: string) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage(
          { 
            type: "AI_QUERY", 
            message: "Analyze this problem and give me a hint about the approach:", 
            problemStatement: description 
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error generating AI response:", chrome.runtime.lastError);
              setAiResponse("Unable to generate AI response.");
              setError(chrome.runtime.lastError.message || "Unknown error");
              return;
            }
            setAiResponse(response?.answer || "No AI response generated");
          }
        );
      } catch (err) {
        console.error("Error in generateAiResponse:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
  };

  const fetchRelatedQuestions = (title: string) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage(
          { 
            type: "AI_QUERY", 
            message: `Suggest 3 related LeetCode problems to "${title}" that would help me practice similar concepts. Just list the names only.` 
          },
          (response) => {
            if (chrome.runtime.lastError || !response?.answer) {
              if (chrome.runtime.lastError) {
                console.error("Error fetching related questions:", chrome.runtime.lastError);
                setError(chrome.runtime.lastError.message || "Unknown error");
              }
              return;
            }
            
            // Parse the response to extract problem names
            const text = response.answer;
            const problems = text.split('\n')
              .filter((line: string) => line.trim() !== '')
              .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
              .filter((line: string) => line.length > 0 && line.length < 100); // Reasonable length for a problem name
            
            setRelatedQuestions(problems.slice(0, 3));
          }
        );
      } catch (err) {
        console.error("Error in fetchRelatedQuestions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
  };

  const startInterview = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab?.id) {
            chrome.tabs.sendMessage(
              activeTab.id,
              { action: "startInterview" }
            );
          }
        });
      } catch (err) {
        console.error("Error in startInterview:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 CodeBlitz</h1>
        <p className="tagline">Your AI assistant for LeetCode & YouTube</p>
        <p style={{ marginTop: 8 }}>
          <a href="https://www.leeco.ai/?_blank" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed' }}>
            Start Learning on Leeco →
          </a>
        </p>
      </header>

      <main className="main">
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="loading">
            <p>Loading problem details...</p>
          </div>
        ) : leetcodeTitle ? (
          <div className="leetcode-problem">
            <div className="leetcode-title">
              <h3>📘 Current Problem:</h3>
              <p>{leetcodeTitle}</p>
            </div>
            
            {aiResponse && (
              <div className="ai-analysis">
                <h3>🧠 AI Analysis:</h3>
                <p>{aiResponse}</p>
              </div>
            )}
            
            {relatedQuestions.length > 0 && (
              <div className="related-questions">
                <h3>🔗 Related Problems:</h3>
                <ul>
                  {relatedQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="action-buttons">
              <button className="interview-btn" onClick={startInterview}>
                Start AI Interview
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="features-list">
              <li>✅ AI Hints for LeetCode</li>
              <li>🎯 Video Summaries & Highlights</li>
              <li>💬 Mock Interview Simulations</li>
              <li>📊 Personalized Learning Paths</li>
            </ul>

            <div className="cta">
              <p>Visit a supported site to get started:</p>
              <ul>
                <li><a href="https://leetcode.com" target="_blank" rel="noopener noreferrer">LeetCode</a></li>
                <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
