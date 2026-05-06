import OpenAI from 'openai';
import agents from '../lib/agents/index.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agentName, message, projectName, rawInput, analyses, history } = req.body;

    if (!agentName || !message) {
      return res.status(400).json({ error: 'agentName and message are required' });
    }

    const agent = agents[agentName];
    if (!agent) {
      return res.status(400).json({ error: `Unknown agent: ${agentName}` });
    }

    let systemPrompt = agent.systemPrompt;
    systemPrompt += `\n\nYou are now in CONVERSATION MODE. The user wants to discuss the project requirements and your analysis. Be helpful, specific, and reference your previous analysis when relevant.\n`;

    if (projectName) systemPrompt += `\nProject: "${projectName}"`;
    if (rawInput) systemPrompt += `\nRaw Requirements:\n${rawInput}\n`;

    if (analyses && Object.keys(analyses).length > 0) {
      systemPrompt += '\nPrevious Analysis Results:\n';
      for (const [name, data] of Object.entries(analyses)) {
        systemPrompt += `\n${name}'s output: ${JSON.stringify(data)}\n`;
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history.map(h => ({ role: h.role, content: h.content })) : []),
      { role: 'user', content: message },
    ];

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.5,
      max_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    res.status(200).json({ response: content, agent: agentName });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
}
