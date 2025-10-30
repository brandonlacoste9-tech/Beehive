// lib/agent-schema.js
// Zod schema and validator for agent LLM output
const { z } = require('zod');

const AgentActionSchema = z.object({
  action: z.enum(['click', 'type', 'select', 'noop']),
  selector: z.string().min(1),
  value: z.string().optional(),
  confidence: z.number().min(0).max(1),
  explain: z.string().min(1)
});

function validateAgentAction(obj) {
  return AgentActionSchema.parse(obj);
}

module.exports = { AgentActionSchema, validateAgentAction };