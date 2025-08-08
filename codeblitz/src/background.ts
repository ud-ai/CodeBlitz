// Environment variables are handled by Vite's environment plugin
// The API key is accessed via import.meta.env.GEMINI_API_KEY

chrome.runtime.onInstalled.addListener(() => {
  console.log("CodeBlitz Extension Installed");
});

// Listener for AI queries from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "AI_QUERY") {
    const prompt = request.prompt || request.message;
    const problemStatement = request.problemStatement || "";
    const conversationMode: 'interview' | 'normal' = request.mode === 'interview' ? 'interview' : 'normal';
    
    // Create a promise to handle the API call
    const fetchData = async () => {
      try {
        // Set up timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
        
        try {
          const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": import.meta.env.GEMINI_API_KEY || "" // Using environment variable for API key
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: problemStatement ? 
                        `Problem context:\n${problemStatement}\n\nUser message:\n${prompt}` : prompt
                    }
                  ]
                }
              ],
              systemInstruction: {
                role: "system",
                parts: [
                  {
                    text: conversationMode === 'interview'
                      ? "You are an expert LeetCode interviewer and mentor. Conduct a conversational interview: 1) ask one concise question at a time; 2) never give full solutions; 3) provide granular hints based on user's last message; 4) encourage verbal reasoning; 5) keep replies under 120 words; 6) include at most one follow-up question. If the user asks for examples, give minimal examples, not full code."
                      : "You are a helpful coding mentor. Provide clear, concise guidance and brief code snippets only when explicitly requested. Prefer stepwise reasoning, bullet points, and keep answers actionable under 150 words."
                  }
                ]
              },
              generationConfig: {
                temperature: conversationMode === 'interview' ? 0.6 : 0.7,
                maxOutputTokens: 700
              }
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Gemini response data:", data); // ✅ Log entire response for debugging

          if (data?.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts && data.candidates[0].content.parts.length > 0) {
            const reply = data.candidates[0].content.parts[0].text.trim();
            return { answer: reply };
          } else if (data?.error) {
            console.error("Gemini API Error:", data.error);
            return { answer: "Gemini API error: " + data.error.message };
          } else {
            return { answer: "No valid response received from AI." };
          }
        } catch (fetchError) {
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error("Request timed out. Please try again.");
          }
          throw fetchError;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        return { 
          error: err instanceof Error ? err.message : String(err),
          answer: "Network or Gemini error: " + (err instanceof Error ? err.message : String(err)) 
        };
      }
    };

    // Execute the fetch and handle the response
    fetchData().then(result => {
      try {
        sendResponse(result);
      } catch (error) {
        console.error("Error sending response:", error);
      }
    }).catch(error => {
      console.error("Unexpected error in fetchData:", error);
      try {
        sendResponse({ answer: "Unexpected error: " + (error instanceof Error ? error.message : String(error)) });
      } catch (sendError) {
        console.error("Error sending error response:", sendError);
      }
    });

    return true; // Needed to allow async sendResponse
  }
});
