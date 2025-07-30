console.log("CodeBlitz content script loaded");

if (window.location.hostname.includes("leetcode.com")) {
  console.log("You're on LeetCode!");

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === "GET_LEETCODE_TITLE") {
      const titleElement = document.querySelector("h1");
      const titleText = titleElement?.innerText || document.title;
      sendResponse({ title: titleText });
    }
    return true; // Required for async sendResponse
  });
}
