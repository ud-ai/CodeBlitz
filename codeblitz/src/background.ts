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
        const apiKey = (import.meta as any).env?.GEMINI_API_KEY || "";
        if (!apiKey) {
          return { answer: "⚠️ Gemini API key missing. Set GEMINI_API_KEY in .env and rebuild." };
        }
        // Set up timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
        
        try {
          const modelPrimary = 'gemini-2.0-flash';
          const modelFallback = 'gemini-1.5-flash';
          const makeBody = (useLean: boolean) => ({
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
            ...(useLean ? {} : {
              systemInstruction: {
                role: "system",
                parts: [
                  {
                    text: conversationMode === 'interview'
                      ? [
                        "You are an expert LeetCode interviewer and mentor.",
                        "- Ask ONE concise question at a time.",
                        "- Prefer hints over solutions.",
                        "- Keep replies under 120 words.",
                        "- Use simple Markdown for lists.",
                        "- When user requests code, provide only a small snippet and explain in comments.",
                      ].join('\n')
                      : [
                        "You are a helpful coding mentor.",
                        "- Provide clear, concise guidance.",
                        "- When explicitly asked for code, provide a minimal, correct solution with the exact language the user is using on the page (deduce from LeetCode language snippet if possible; default to JavaScript).",
                        "- Wrap code in fenced Markdown blocks with language tags, keep under 80 cols where practical.",
                        "- Prefer stepwise reasoning and bullets."
                      ].join('\n')
                  }
                ]
              }
            }),
            generationConfig: {
              temperature: conversationMode === 'interview' ? 0.6 : 0.7,
              maxOutputTokens: 700
            }
          });

          async function callModel(model: string, lean: boolean) {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
              },
              body: JSON.stringify(makeBody(lean)),
              signal: controller.signal
            });
            return res;
          }

          // First try primary model with full body
          let response = await callModel(modelPrimary, false);
          if (!response.ok && response.status === 400) {
            // Retry with a lean body (no systemInstruction) for compatibility
            response = await callModel(modelPrimary, true);
          }
          if (!response.ok && response.status === 400) {
            // Retry with fallback model
            response = await callModel(modelFallback, true);
          }
          if (!response.ok) {
            let errText = `API responded with status: ${response.status}`;
            try {
              const errJson = await response.json();
              if (errJson?.error?.message) errText += ` - ${errJson.error.message}`;
            } catch {}
            throw new Error(errText);
          }
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Gemini response data:", data); // ✅ Log entire response for debugging

          const first = data?.candidates?.[0];
          const parts = first?.content?.parts || [];
          const reply = Array.isArray(parts)
            ? parts.map((p: any) => {
                if (typeof p?.text === 'string') return p.text;
                if (p?.inlineData?.data) return atob(p.inlineData.data);
                return '';
              }).join('')?.trim()
            : '';

          if (reply) {
            return { answer: reply };
          } else if (data?.error) {
            console.error("Gemini API Error:", data.error);
            return { answer: `Gemini API error: ${data.error.message} (code: ${data.error.code || 'unknown'})` };
          } else if (data?.promptFeedback?.blockReason) {
            return { answer: `Response blocked by safety: ${data.promptFeedback.blockReason}` };
          } else {
            return { answer: "No valid response received from AI (empty candidates)." };
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
