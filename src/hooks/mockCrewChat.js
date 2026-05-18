const MOCK_FRAMES = {
  aria: {
    label: 'Aria',
    role: 'Requirement Analyst',
    lead: 'I am treating this as a scope and acceptance check.',
    bullets: [
      'Clarify the exact outcome and any constraints.',
      'Turn the request into testable acceptance criteria.',
      'Flag open questions before work starts.',
    ],
    tail: 'If you want, I can convert this into a concise requirements checklist.',
  },
  quinn: {
    label: 'Quinn',
    role: 'QA Engineer',
    lead: 'I am reading this as a testability check.',
    bullets: [
      'Validate the happy path first.',
      'Probe edge cases and failure states.',
      'Confirm the change does not regress the current flow.',
    ],
    tail: 'If useful, I can turn this into a compact test matrix.',
  },
  rex: {
    label: 'Rex',
    role: 'Tech Lead',
    lead: 'I am looking at this from an implementation and tradeoff angle.',
    bullets: [
      'Keep the change local and easy to reason about.',
      'Separate the core path from optional enhancements.',
      'Prefer the smallest stable integration point.',
    ],
    tail: 'I can also outline a minimal implementation path if you want one.',
  },
  sage: {
    label: 'Sage',
    role: 'Project Manager',
    lead: 'I am translating this into a next-step plan.',
    bullets: [
      'Sequence the work into a clear order.',
      'Surface blockers early so the crew stays aligned.',
      'Keep the scope small enough to ship cleanly.',
    ],
    tail: 'I can turn this into a short action plan whenever you are ready.',
  },
};

function titleCase(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function truncate(value, maxLength) {
  if (!value) return '';
  const compact = String(value).replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function formatList(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function buildMockCrewResponse({ agent, message, projectName, rawInput, analyses = {}, history = [] }) {
  const frame = MOCK_FRAMES[agent] || MOCK_FRAMES.sage;
  const projectLabel = projectName ? `about **${projectName}**` : 'for this project';
  const question = truncate(message, 140);
  const brief = truncate(rawInput, 140);
  const analysisNames = Object.keys(analyses).map(titleCase);

  const sections = [
    `**${frame.label}** · ${frame.role}`,
    frame.lead,
    `You asked ${projectLabel}: "${question}".`,
    brief ? `Project brief snapshot: ${brief}.` : null,
    analysisNames.length ? `I can also see context from ${formatList(analysisNames)}.` : 'I am answering from the current prompt and project context.',
    history.length ? `This thread already has ${history.length} message${history.length === 1 ? '' : 's'}.` : null,
    `- ${frame.bullets[0]}\n- ${frame.bullets[1]}\n- ${frame.bullets[2]}`,
    frame.tail,
  ].filter(Boolean);

  return sections.join('\n\n');
}