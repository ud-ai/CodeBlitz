# CodeBlitz

CodeBlitz is a Chrome extension that adds an AI mock interviewer to LeetCode. It reads the problem on the page and uses Gemini to run a practice interview in a sidebar, favoring hints over full solutions.

## Features

- **Interview mode:** asks one concise question at a time, prefers hints over answers, and shows a session timer.
- **Mentor mode:** gives general guidance and returns code when you ask for it.
- **Problem-aware prompts:** sends the problem statement from the page to Gemini as context.
- **Voice input:** dictate answers using the Web Speech API.
- **Saved conversations:** keeps chat history for each problem in Chrome storage.
- **Quick actions:** one-click prompts to explain the problem, show an example, or define key terms.
- **Adjustable sidebar:** resize or collapse it, and it remembers your layout.

## Tech stack

React, TypeScript, Vite, tsup, Chrome Extension Manifest V3, and the Gemini API.

## How it works

| Part | File | Role |
| --- | --- | --- |
| Content script | `codeblitz/src/contentScript.ts` | Adds the sidebar to LeetCode and reads the problem |
| Background service worker | `codeblitz/src/background.ts` | Calls Gemini, with a 25-second timeout, retries, and model fallback |
| Popup | `codeblitz/src/App.tsx` | Shows the current problem and starts an interview |

## Setup

You need Node.js and a [Gemini API key](https://aistudio.google.com/app/apikey).

```bash
cd codeblitz
npm install
cp .env.example .env   # then add your key to .env
npm run build:all
```

Then load the extension in Chrome:

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked** and choose `codeblitz/dist`.
4. Open a LeetCode problem and select **Start AI Interview**.

The build scripts use the Windows `copy` command, so on macOS or Linux, replace it with `cp` in `package.json`.

## Security

Your API key is written into the built extension, so this setup is for local use only. Don't publish or share a build that contains your key. `.env` and the generated scripts in `public/` are ignored by Git.

To distribute the extension, move the Gemini calls to a backend so the key stays on a server.
