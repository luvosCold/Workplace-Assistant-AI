/* AI Workplace Productivity Assistant - Client-side Prototype
   Uses structured prompt templates + deterministic-but-contextual generation
   to produce professional outputs without external API keys.
*/

// ---------- Navigation ----------
const views = document.querySelectorAll('.view');
const links = document.querySelectorAll('.sidebar-link');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');

const titles = {
  dashboard: 'Dashboard',
  email: 'Smart Email Generator',
  meeting: 'Meeting Notes Summarizer',
  tasks: 'AI Task Planner',
  research: 'AI Research Assistant',
  chat: 'AI Chatbot'
};

function showView(name) {
  views.forEach(v => v.classList.add('hidden'));
  const target = document.getElementById('view-' + name);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('fade-in');
  }
  links.forEach(l => {
    l.classList.toggle('active', l.dataset.view === name);
  });
  pageTitle.textContent = titles[name] || 'Dashboard';
  // close mobile sidebar
  sidebar.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
}

links.forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.goto));
});

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
});
overlay.addEventListener('click', () => {
  sidebar.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
});

// ---------- Helpers ----------
function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function showLoading(id) {
  document.getElementById(id).classList.remove('hidden');
}
function hideLoading(id) {
  document.getElementById(id).classList.add('hidden');
}
function showResult(id) {
  document.getElementById(id).classList.remove('hidden');
}

function copyText(elId) {
  const text = document.getElementById(elId).innerText;
  navigator.clipboard.writeText(text).then(() => {
    // brief feedback could be added
  });
}

// ---------- Structured Prompt Templates (for transparency & consistency) ----------
const PROMPTS = {
  email: (purpose, tone, audience) => `
You are an expert business communication specialist.
Task: Write a clear, professional email.
Purpose: ${purpose}
Tone: ${tone}
Audience: ${audience}
Constraints:
- Subject line + body
- Opening that matches the relationship
- One clear call-to-action
- Closing that fits the tone
- Keep under 180 words
- No fluff or clichés
Output format:
Subject: ...
---
Body text
`,

  meeting: (notes) => `
You are an expert meeting facilitator and note-taker.
Task: Summarize the following meeting notes into a structured professional brief.
Notes:
"""
${notes}
"""
Output exactly these sections:
## Key Points
- 3–6 bullet points of decisions and important discussion
## Action Items
- Bullet list with owner if mentioned, otherwise "Unassigned"
## Deadlines & Dates
- Any mentioned dates or implied timelines
## Open Questions
- Unresolved items (if any)
Be concise and factual. Do not invent information.
`,

  tasks: (taskList, hours, style) => `
You are a productivity coach and prioritization expert.
Task: Create a prioritized daily plan.
Tasks:
${taskList}
Available hours: ${hours}
Focus style: ${style}
Method: Eisenhower-inspired + time-blocking.
Output:
## Priority Ranking
1. Task – why high priority
...
## Suggested Schedule
Time block | Task | Estimated duration
## Focus Tips
2–3 short recommendations matching the chosen style.
Do not invent tasks that were not provided.
`,

  research: (query, depth) => `
You are a research analyst.
Topic: ${query}
Depth: ${depth}
Produce a professional research brief with:
## Executive Summary
2–3 sentences
## Key Insights
4–6 bullet points
## Implications for Work
Practical takeaways
## Suggested Next Steps
2–3 actions
Stay factual, balanced, and useful for a knowledge worker. Note that this is synthesized knowledge, not live web search.
`,

  chat: (message) => `
You are a helpful, professional workplace productivity assistant.
User message: ${message}
Respond clearly, practically, and in a supportive professional tone.
Keep answers focused and actionable. If the question is outside work/productivity, gently steer back or answer briefly.
`
};

// ---------- AI Simulation Engines (structured, contextual) ----------

function generateEmail(purpose, tone, audience) {
  const toneMap = {
    professional: { greeting: 'Hi', closing: 'Best regards', style: 'clear and direct' },
    friendly: { greeting: 'Hi', closing: 'Thanks so much', style: 'warm and approachable' },
    formal: { greeting: 'Dear', closing: 'Sincerely', style: 'formal and precise' },
    assertive: { greeting: 'Hi', closing: 'Looking forward to your confirmation', style: 'confident and decisive' },
    concise: { greeting: 'Hi', closing: 'Thanks', style: 'brief and to the point' }
  };
  const audMap = {
    colleague: 'colleague',
    manager: 'manager',
    client: 'valued client',
    team: 'team',
    executive: 'leadership team'
  };
  const t = toneMap[tone] || toneMap.professional;
  const a = audMap[audience] || 'colleague';

  // Simple extraction of key intent
  const lower = purpose.toLowerCase();
  let subject = 'Follow-up';
  if (lower.includes('proposal') || lower.includes('q3') || lower.includes('q4')) subject = 'Follow-up on Proposal Discussion';
  else if (lower.includes('meeting')) subject = 'Meeting Follow-up';
  else if (lower.includes('request') || lower.includes('need')) subject = 'Request for Input';
  else if (lower.includes('update')) subject = 'Status Update';
  else if (lower.includes('thank')) subject = 'Thank You';
  else subject = purpose.slice(0, 50).replace(/\n/g, ' ').trim() || 'Quick Note';

  let body = '';
  if (tone === 'formal') {
    body = `${t.greeting} [Name],\n\nI am writing regarding ${purpose.trim()}.\n\nI would appreciate your feedback or decision at your earliest convenience so we can proceed accordingly.\n\nPlease let me know if you require any additional information.\n\n${t.closing},\n[Your Name]`;
  } else if (tone === 'assertive') {
    body = `${t.greeting} [Name],\n\nFollowing up on ${purpose.trim()}.\n\nTo keep momentum, I recommend we finalize this by the end of the week. Please confirm your position or preferred next step by Friday.\n\nHappy to jump on a quick call if helpful.\n\n${t.closing},\n[Your Name]`;
  } else if (tone === 'concise') {
    body = `${t.greeting} [Name],\n\n${purpose.trim()}.\n\nCould you please confirm / share your thoughts by EOD Friday?\n\n${t.closing},\n[Your Name]`;
  } else if (tone === 'friendly') {
    body = `${t.greeting} [Name],\n\nHope you're doing well! I wanted to circle back on ${purpose.trim()}.\n\nWould love to hear your thoughts when you have a moment. Happy to adjust based on what works best for you.\n\n${t.closing},\n[Your Name]`;
  } else {
    body = `${t.greeting} [Name],\n\nI hope this message finds you well. I am reaching out regarding ${purpose.trim()}.\n\nPlease let me know your thoughts or preferred next steps at your convenience. I am happy to provide any additional details needed.\n\n${t.closing},\n[Your Name]`;
  }

  return `Subject: ${subject}\n\n${body}`;
}

function generateMeetingSummary(notes) {
  if (!notes.trim()) return '<p>Please provide meeting notes to summarize.</p>';

  // Heuristic extraction
  const lines = notes.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const actionKeywords = /action|todo|follow.?up|assign|will |need to|should |owner|responsible|by friday|by monday|deadline|due/i;
  const dateKeywords = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|by \d|eod|eow|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})\b/i;
  const questionKeywords = /\?|open|unclear|tbd|to be decided|pending/i;

  const keyPoints = [];
  const actions = [];
  const deadlines = [];
  const questions = [];

  lines.forEach(line => {
    if (actionKeywords.test(line)) actions.push(line);
    else if (dateKeywords.test(line)) deadlines.push(line);
    else if (questionKeywords.test(line)) questions.push(line);
    else if (line.length > 25) keyPoints.push(line);
  });

  // Fallbacks for demo quality
  if (keyPoints.length === 0) {
    keyPoints.push('Discussion covered the main agenda items provided in the notes.');
    if (lines[0]) keyPoints.push(lines[0].slice(0, 120));
  }
  if (actions.length === 0) {
    actions.push('Review notes and confirm owners (Unassigned)');
  }

  let html = '<h3>Key Points</h3><ul>';
  keyPoints.slice(0, 6).forEach(p => { html += `<li>${escapeHtml(p)}</li>`; });
  html += '</ul><h3>Action Items</h3><ul>';
  actions.slice(0, 8).forEach(a => { html += `<li>${escapeHtml(a)}</li>`; });
  html += '</ul>';

  if (deadlines.length) {
    html += '<h3>Deadlines & Dates</h3><ul>';
    deadlines.slice(0, 5).forEach(d => { html += `<li>${escapeHtml(d)}</li>`; });
    html += '</ul>';
  } else {
    html += '<h3>Deadlines & Dates</h3><p>No explicit deadlines detected. Consider adding target dates to action items.</p>';
  }

  if (questions.length) {
    html += '<h3>Open Questions</h3><ul>';
    questions.slice(0, 4).forEach(q => { html += `<li>${escapeHtml(q)}</li>`; });
    html += '</ul>';
  } else {
    html += '<h3>Open Questions</h3><p>None identified from the provided notes.</p>';
  }

  return html;
}

function generateTaskPlan(taskText, hours, style) {
  const tasks = taskText.split(/\n+/).map(t => t.trim()).filter(Boolean);
  if (tasks.length === 0) return '<p>Please enter at least one task.</p>';

  // Simple scoring for priority
  const scored = tasks.map((t, i) => {
    let score = 50 - i; // order bias
    const lower = t.toLowerCase();
    if (/urgent|asap|critical|deadline|today|client|presentation|proposal|review|approve/.test(lower)) score += 30;
    if (/email|reply|quick|call|schedule|1:1|meeting/.test(lower)) score += 10;
    if (/roadmap|strategy|plan|research|draft/.test(lower)) score += 15;
    return { task: t, score };
  });
  scored.sort((a, b) => b.score - a.score);

  let html = '<h3>Priority Ranking</h3><ol class="list-decimal pl-5 space-y-1">';
  scored.forEach((s, idx) => {
    const reason = idx === 0 ? 'Highest impact / urgency' :
                   idx < 3 ? 'Important for progress today' : 'Supporting / lower urgency';
    html += `<li><strong>${escapeHtml(s.task)}</strong> — ${reason}</li>`;
  });
  html += '</ol>';

  // Time blocking
  const hrs = Math.max(1, Math.min(16, parseInt(hours) || 6));
  const blockSize = Math.max(0.5, Math.round((hrs / Math.min(tasks.length, 6)) * 2) / 2);
  let current = 9; // start 9:00
  html += '<h3>Suggested Schedule</h3><ul>';
  const maxBlocks = Math.min(scored.length, Math.floor(hrs / 0.5));
  for (let i = 0; i < maxBlocks; i++) {
    const startH = Math.floor(current);
    const startM = (current % 1) * 60;
    const end = current + blockSize;
    const endH = Math.floor(end);
    const endM = (end % 1) * 60;
    const timeStr = `${pad(startH)}:${pad(startM)} – ${pad(endH)}:${pad(endM)}`;
    html += `<li><strong>${timeStr}</strong> · ${escapeHtml(scored[i].task)} <span class="text-slate-400">(~${blockSize}h)</span></li>`;
    current = end + 0.25; // small break
    if (current >= 12 && current < 13) current = 13; // lunch
  }
  html += '</ul>';

  html += '<h3>Focus Tips</h3><ul>';
  if (style === 'deep-work') {
    html += '<li>Protect the first 90–120 minutes for your highest-priority deep work.</li>';
    html += '<li>Batch shallow tasks (email, scheduling) into a single afternoon block.</li>';
    html += '<li>Silence notifications during focus blocks.</li>';
  } else if (style === 'quick-wins') {
    html += '<li>Start with 1–2 quick, high-visibility tasks to build momentum.</li>';
    html += '<li>Use remaining energy for deeper items after early wins.</li>';
    html += '<li>Time-box each quick task to avoid over-polishing.</li>';
  } else {
    html += '<li>Alternate focused work with lighter administrative tasks to sustain energy.</li>';
    html += '<li>Review the plan mid-afternoon and adjust if priorities shift.</li>';
    html += '<li>Leave a 15–20 minute buffer for unexpected requests.</li>';
  }
  html += '</ul>';

  return html;
}

function generateResearch(query, depth) {
  if (!query.trim()) return '<p>Please enter a research topic or question.</p>';

  const q = query.trim();
  const lower = q.toLowerCase();

  // Contextual canned insights based on keywords + generic structure
  let insights = [];
  let summary = '';
  let implications = [];
  let nextSteps = [];

  if (/remote|hybrid|work from home|wfh|distributed/.test(lower)) {
    summary = 'Remote and hybrid work continue to reshape productivity practices. Successful teams combine clear asynchronous communication norms with intentional synchronous collaboration and strong outcome-based measurement.';
    insights = [
      'Async-first documentation reduces meeting load and improves clarity across time zones.',
      'Outcome-based goals (OKRs or similar) outperform hours-based tracking for distributed teams.',
      'Regular “office hours” or optional co-working sessions maintain social cohesion without forcing presence.',
      'Tool sprawl is a common pain point; consolidating core collaboration platforms improves focus.',
      'Manager capability in remote leadership remains a key differentiator for retention and performance.'
    ];
    implications = [
      'Audit current meeting cadence and convert status updates to written async formats where possible.',
      'Define team working agreements around response times and core collaboration hours.'
    ];
    nextSteps = [
      'Map current tools and eliminate redundant ones.',
      'Pilot one async ritual (e.g., weekly written updates) for two weeks and measure impact.',
      'Share a short team agreement on communication norms.'
    ];
  } else if (/ai|artificial intelligence|llm|chatgpt|automation/.test(lower)) {
    summary = 'AI tools are rapidly becoming standard in knowledge work for drafting, summarizing, research, and routine task automation. The highest value comes from integrating AI into existing workflows with clear human oversight.';
    insights = [
      'Generative AI excels at first drafts, summarization, and idea expansion; humans remain essential for judgment and accuracy.',
      'Prompt quality and structured context dramatically improve output usefulness.',
      'Privacy and data governance policies are critical when using AI with internal information.',
      'Teams that train employees on effective AI use see faster adoption and better results than those that simply provide access.',
      'Measuring time saved and quality of output helps justify continued investment.'
    ];
    implications = [
      'Identify 2–3 high-frequency tasks suitable for AI assistance (email, notes, research).',
      'Establish simple review guidelines so AI outputs are never used without human verification.'
    ];
    nextSteps = [
      'Document internal guidelines for acceptable AI use.',
      'Run a short pilot with one team on a specific use case and collect feedback.',
      'Share example prompts that work well for your domain.'
    ];
  } else if (/productivity|priorit|time management|focus/.test(lower)) {
    summary = 'Sustainable productivity relies on prioritization systems, deliberate focus blocks, and realistic capacity planning rather than simply working longer hours.';
    insights = [
      'Most professionals overestimate available deep-work time; protecting 2–3 hours of uninterrupted focus yields outsized results.',
      'Weekly planning combined with daily prioritization beats ad-hoc task lists.',
      'Energy management (matching task type to energy level) is as important as time management.',
      'Saying no or negotiating deadlines is a core professional skill that protects quality and wellbeing.',
      'Reviewing completed work weekly builds better estimation and prioritization instincts.'
    ];
    implications = [
      'Block recurring focus time on the calendar and treat it as non-negotiable.',
      'Limit work-in-progress; finish or explicitly park items rather than context-switching constantly.'
    ];
    nextSteps = [
      'Choose one prioritization method (e.g., Eisenhower or simple A/B/C) and use it for one week.',
      'Identify your highest-energy time of day and schedule the most important work then.',
      'End each day by selecting the top 3 priorities for tomorrow.'
    ];
  } else {
    summary = `A structured look at “${escapeHtml(q)}” for professional application. The insights below are synthesized to support practical decision-making and further investigation.`;
    insights = [
      'Clarify the specific decision or outcome you need from this research to keep exploration focused.',
      'Look for both supporting evidence and counter-arguments to avoid confirmation bias.',
      'Distinguish between established practices and emerging trends when evaluating relevance.',
      'Consider organizational context (size, industry, culture) when applying external insights.',
      'Primary sources and recent data generally outweigh secondary summaries for high-stakes topics.'
    ];
    implications = [
      'Translate findings into 1–2 concrete experiments or process changes rather than broad initiatives.',
      'Share a short briefing with stakeholders to align on interpretation and next actions.'
    ];
    nextSteps = [
      'Define the decision this research is meant to inform.',
      'Identify 2–3 trusted sources for deeper reading.',
      'Schedule a short review to turn insights into an action list.'
    ];
  }

  // Adjust length by depth
  if (depth === 'brief') {
    insights = insights.slice(0, 3);
    nextSteps = nextSteps.slice(0, 2);
  } else if (depth === 'detailed') {
    // keep full
  }

  let html = `<h3>Executive Summary</h3><p>${summary}</p>`;
  html += '<h3>Key Insights</h3><ul>';
  insights.forEach(i => { html += `<li>${i}</li>`; });
  html += '</ul><h3>Implications for Work</h3><ul>';
  implications.forEach(i => { html += `<li>${i}</li>`; });
  html += '</ul><h3>Suggested Next Steps</h3><ul>';
  nextSteps.forEach(i => { html += `<li>${i}</li>`; });
  html += '</ul>';
  html += '<p class="text-xs text-slate-400 mt-3">Note: This is a synthesized brief based on general knowledge patterns, not live web search. Verify critical facts with primary sources.</p>';
  return html;
}

function generateChatReply(message) {
  const lower = message.toLowerCase().trim();
  if (!lower) return "I'm here when you're ready. What would you like help with?";

  if (/hello|hi |hey|good morning|good afternoon/.test(lower)) {
    return "Hello! How can I support your work today? I can help with prioritization, email drafting guidance, meeting prep, or productivity strategies.";
  }
  if (/priorit|what should i (do|work)|focus|overwhelm|too much/.test(lower)) {
    return "When everything feels urgent, try this quick filter:\n\n1. What has a real external deadline in the next 48 hours?\n2. What unblocks other people?\n3. What moves a key goal forward this week?\n\nPick the top 1–3 items that score high on those, schedule focused time for them first, and park or decline the rest for now. Would you like help ranking a specific list?";
  }
  if (/email|write|draft|message/.test(lower)) {
    return "For stronger emails: state the purpose in the first sentence, keep one clear ask, and match tone to the relationship. You can use the Smart Email Generator in the sidebar for a full draft—just describe the purpose, choose tone and audience, and generate. Want tips for a specific situation?";
  }
  if (/meeting|notes|summar/.test(lower)) {
    return "After meetings, capture decisions, owners, and dates while they're fresh. Paste raw notes into the Meeting Notes Summarizer to get structured key points, action items, and deadlines. I can also help you prepare an agenda if you share the meeting goal.";
  }
  if (/burnout|stress|balance|tired/.test(lower)) {
    return "Sustained performance needs recovery. Practical steps: protect at least one focus block and one short break daily, batch communications, and end the day by writing tomorrow's top 3. If workload is consistently unrealistic, document capacity and discuss prioritization with your manager. Small boundary experiments often help more than waiting for a perfect system.";
  }
  if (/thank|thanks/.test(lower)) {
    return "You're welcome. Glad to help—reach out anytime you need a second perspective on work or productivity.";
  }
  // Generic professional reply
  return `Thanks for the question. Here's a practical take:\n\nClarify the outcome you need, break the work into the smallest useful next step, and set a short time box to make progress. If you'd like a more specific recommendation, share a bit more context (goal, constraints, or timeline) and I'll tailor the advice.\n\nYou can also try the specialized tools in the sidebar for email, meeting summaries, task planning, or research.`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function pad(n) {
  return String(Math.floor(n)).padStart(2, '0');
}

// ---------- Wire up feature buttons ----------

// Email
document.getElementById('email-generate').addEventListener('click', async () => {
  const purpose = document.getElementById('email-purpose').value.trim();
  const tone = document.getElementById('email-tone').value;
  const audience = document.getElementById('email-audience').value;
  if (!purpose) {
    alert('Please describe the purpose of the email.');
    return;
  }
  showLoading('email-loading');
  document.getElementById('email-result').classList.add('hidden');
  await delay(900 + Math.random() * 600);
  const output = generateEmail(purpose, tone, audience);
  document.getElementById('email-output').textContent = output;
  hideLoading('email-loading');
  showResult('email-result');
});
document.getElementById('email-copy').addEventListener('click', () => copyText('email-output'));

// Meeting
document.getElementById('meeting-generate').addEventListener('click', async () => {
  const notes = document.getElementById('meeting-notes').value.trim();
  if (!notes) {
    alert('Please paste meeting notes or a transcript.');
    return;
  }
  showLoading('meeting-loading');
  document.getElementById('meeting-result').classList.add('hidden');
  await delay(1000 + Math.random() * 700);
  const output = generateMeetingSummary(notes);
  document.getElementById('meeting-output').innerHTML = output;
  hideLoading('meeting-loading');
  showResult('meeting-result');
});
document.getElementById('meeting-copy').addEventListener('click', () => copyText('meeting-output'));

// Tasks
document.getElementById('tasks-generate').addEventListener('click', async () => {
  const taskText = document.getElementById('tasks-input').value.trim();
  const hours = document.getElementById('tasks-hours').value;
  const style = document.getElementById('tasks-style').value;
  if (!taskText) {
    alert('Please enter at least one task.');
    return;
  }
  showLoading('tasks-loading');
  document.getElementById('tasks-result').classList.add('hidden');
  await delay(900 + Math.random() * 500);
  const output = generateTaskPlan(taskText, hours, style);
  document.getElementById('tasks-output').innerHTML = output;
  hideLoading('tasks-loading');
  showResult('tasks-result');
});
document.getElementById('tasks-copy').addEventListener('click', () => copyText('tasks-output'));

// Research
document.getElementById('research-generate').addEventListener('click', async () => {
  const query = document.getElementById('research-query').value.trim();
  const depth = document.getElementById('research-depth').value;
  if (!query) {
    alert('Please enter a research topic or question.');
    return;
  }
  showLoading('research-loading');
  document.getElementById('research-result').classList.add('hidden');
  await delay(1100 + Math.random() * 800);
  const output = generateResearch(query, depth);
  document.getElementById('research-output').innerHTML = output;
  hideLoading('research-loading');
  showResult('research-result');
});
document.getElementById('research-copy').addEventListener('click', () => copyText('research-output'));

// Chat
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

function appendChat(role, text) {
  const row = document.createElement('div');
  row.className = 'flex gap-3' + (role === 'user' ? ' justify-end' : '');
  if (role === 'user') {
    row.innerHTML = `<div class="bg-brand-600 text-white rounded-lg px-3.5 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap">${escapeHtml(text)}</div>`;
  } else {
    row.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">AI</div>
      <div class="bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 max-w-[85%] whitespace-pre-wrap">${escapeHtml(text)}</div>`;
  }
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  appendChat('user', msg);
  chatInput.value = '';
  chatSend.disabled = true;
  await delay(600 + Math.random() * 500);
  const reply = generateChatReply(msg);
  appendChat('assistant', reply);
  chatSend.disabled = false;
  chatInput.focus();
}

chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
});

// Expose prompt templates in console for transparency (structured prompt engineering)
console.log('Structured prompt templates available as PROMPTS object:', PROMPTS);
