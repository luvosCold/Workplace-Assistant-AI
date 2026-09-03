# AI Workplace Productivity Assistant

A modern, responsive web application prototype that helps professionals automate daily work tasks using AI-powered tools.

## Features

- **Smart Email Generator** — Tone + audience-aware professional emails
- **Meeting Notes Summarizer** — Key points, action items, deadlines, open questions
- **AI Task Planner** — Prioritization + time-blocked schedule
- **AI Research Assistant** — Structured insights and summaries
- **AI Chatbot** — Conversational workplace productivity assistant

## Design

- Clean modern SaaS UI (sidebar + card layout)
- Fully responsive (mobile sidebar + desktop)
- Loading states on all AI actions
- Disclaimer on every AI output: “AI-generated content may require human review”

## How to Run

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. No build step or server required — pure HTML + CSS (Tailwind CDN) + JavaScript.

## Technical Notes

- **Structured prompt engineering**: Each feature uses an explicit prompt template (see `PROMPTS` in `app.js`) that defines role, task, constraints, and output format.
- **Prototype AI**: Responses are generated client-side with contextual, rule-based logic that follows the structured prompts. This keeps the prototype fully offline and free of API keys while still demonstrating professional, clear outputs.
- To connect a real LLM later, replace the `generate*` functions with calls to your preferred API, passing the corresponding `PROMPTS.*` string as the system/user prompt.

## Disclaimer

AI-generated content may require human review. Always verify important communications, decisions, and facts before use.
