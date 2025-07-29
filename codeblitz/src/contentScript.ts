console.log("CodeBlitz content script loaded");

if (window.location.hostname.includes("leetcode.com")) {
  console.log("You're on LeetCode!");
  // Future: capture problem title, code editor, etc.
}

if (window.location.hostname.includes("youtube.com")) {
  console.log("You're on YouTube!");
  // Future: read video transcript, time, etc.
}
