import OpenAI from 'openai';
import agents from '../lib/agents/index.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = 'gpt-5.4-nano-2026-03-17';

function buildUserMessage(rawInput, previousOutputs) {
  let message = `## Raw Requirements\n\n${rawInput}`;
  if (previousOutputs?.aria) {
    message += `\n\n## Aria's Requirement Analysis\n\n${JSON.stringify(previousOutputs.aria, null, 2)}`;
  }
  if (previousOutputs?.quinn) {
    message += `\n\n## Quinn's QA Analysis\n\n${JSON.stringify(previousOutputs.quinn, null, 2)}`;
  }
  if (previousOutputs?.rex) {
    message += `\n\n## Rex's Task Breakdown\n\n${JSON.stringify(previousOutputs.rex, null, 2)}`;
  }
  return message;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rawInput, agentName, previousOutputs } = req.body;

    if (!rawInput || !agentName) {
      return res.status(400).json({ error: 'rawInput and agentName are required' });
    }

    const agent = agents[agentName];
    if (!agent) {
      return res.status(400).json({ error: `Unknown agent: ${agentName}` });
    }

    const userMessage = buildUserMessage(rawInput, previousOutputs || {});

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_completion_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const parsed = agent.parseOutput(content);

    res.status(200).json({
      agent: agent.name,
      displayName: agent.displayName,
      role: agent.role,
      color: agent.color,
      emoji: agent.emoji,
      output: parsed,
      tokensUsed: response.usage?.total_tokens || 0,
    });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
}
