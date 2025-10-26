# CodeBlitz - AI Learning Assistant for LeetCode and YouTube

CodeBlitz is a Chrome extension that provides an AI-powered learning assistant for LeetCode problems and YouTube tutorials. It helps users understand coding problems, get implementation tips, and learn more effectively.

## Setup

### Environment Variables

This extension requires a Gemini API key to function properly. Follow these steps to set it up:

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Update the `.env` file with your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. The `.env` file is excluded from Git in `.gitignore` to keep your API key secure

### Development

To start the development server:

```bash
npm run dev
```

### Building

To build the extension for production:

```bash
npm run build:all
```

The built extension will be in the `dist` directory, ready to be loaded into Chrome.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
