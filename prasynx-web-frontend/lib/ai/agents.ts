import type { AIContext, ChatMessage, AIProactiveInsight, AIAction } from '../../types/ai';
import { getToolsForRole, executeToolAction, getToolDefinitionsForSystemPrompt } from './tools';
import { buildSystemPrompt, getPageSuggestions } from './prompts';
import { generateChatCompletion } from './provider';
import { buildContextString, fetchDashboardData } from './context';
import { getMemory, getConversationHistory, saveMessage, extractAndStoreMemory } from './memory';
import { canExecuteAction } from './permissions';

type AgentResponse = {
  content: string;
  conversationId: string;
  actions?: { label: string; action: string }[];
  insights?: AIProactiveInsight[];
};

type AgentHandler = (
  message: string,
  context: AIContext,
  history: ChatMessage[]
) => Promise<AgentResponse>;

async function processWithAI(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): Promise<string> {
  return generateChatCompletion(messages);
}

async function handleToolCall(
  content: string,
  context: AIContext
): Promise<{ response: string; actions: { label: string; action: string }[] }> {
  const toolPattern = /\[ACTION:\s*(\w+)\s*(.*?)\]/;
  const match = content.match(toolPattern);

  if (!match) return { response: content, actions: [] };

  const [, actionName, paramsStr] = match;
  let params: Record<string, unknown> = {};
  try {
    params = paramsStr ? JSON.parse(paramsStr) : {};
  } catch {
    params = {};
  }

  const permissionCheck = canExecuteAction(context, actionName);
  if (!permissionCheck.allowed) {
    return {
      response: content.replace(match[0], `I cannot perform this action: ${permissionCheck.reason}`),
      actions: [],
    };
  }

  const result = await executeToolAction(actionName, params, context);
  const cleanContent = content.replace(match[0], '').trim();

  return {
    response: `${cleanContent}\n\n${result.message}`,
    actions: [{ label: `Executed ${actionName}`, action: actionName }],
  };
}

function generateProactiveInsights(
  context: AIContext,
  _dashboardData: Record<string, unknown>
): AIProactiveInsight[] {
  const insights: AIProactiveInsight[] = [];

  if (context.role === 'visitor') {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'insight',
      severity: 'low',
      message: 'Welcome! I can tell you about Prasynx portals, features, pricing, or help you find the right solution.',
      icon: 'Sparkles',
      createdAt: new Date().toISOString(),
    });
  } else if (context.role === 'student') {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'insight',
      severity: 'low',
      message: 'I can help you track attendance, check grades, or plan your study schedule.',
      icon: 'Bot',
      createdAt: new Date().toISOString(),
    });
  } else if (context.role === 'parent') {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'insight',
      severity: 'low',
      message: 'I can show your child\'s performance, fee status, or recent school updates.',
      icon: 'Users',
      createdAt: new Date().toISOString(),
    });
  } else if (context.role === 'teacher') {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'insight',
      severity: 'low',
      message: 'I can help you create exams, mark attendance, or analyze class performance.',
      icon: 'BookOpen',
      createdAt: new Date().toISOString(),
    });
  } else if (context.role === 'recruiter') {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'insight',
      severity: 'low',
      message: 'I can help you post jobs, screen candidates, or review hiring analytics.',
      icon: 'Briefcase',
      createdAt: new Date().toISOString(),
    });
  } else if (context.role === 'admin') {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'insight',
      severity: 'low',
      message: 'I can help manage users, check security status, or generate reports.',
      icon: 'Shield',
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

// Master Agent Router
export async function masterAgent(
  message: string,
  context: AIContext,
  conversationId?: string
): Promise<AgentResponse & { conversationId: string }> {
  const effectiveConversationId = conversationId || `conv-${Date.now()}`;

  const dashboardData = await fetchDashboardData(context);
  const contextStr = buildContextString({
    ...context,
    data: { ...(context.data || {}), ...dashboardData },
  });
  const memory = await getMemory(context.userId);
  const toolsAvailable = getToolDefinitionsForSystemPrompt(context.role);
  const suggestions = getPageSuggestions(context.page);

  const systemPrompt = buildSystemPrompt(context, memory, contextStr) +
    (toolsAvailable ? `\n\nAvailable Tools:\n${toolsAvailable}` : '') +
    `\n\nTo execute a tool, respond with: [ACTION: tool_name {"param":"value"}]
` +
    `\n\nSuggested prompts for this page:\n${suggestions.map(s => `- ${s}`).join('\n')}`;

  const history = conversationId ? await getConversationHistory(conversationId) : [];

  const aiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
  ];

  let aiResponse = await processWithAI(aiMessages);

  const { response: processedResponse, actions } = await handleToolCall(aiResponse, context);

  await saveMessage(effectiveConversationId, 'user', message);
  await saveMessage(effectiveConversationId, 'assistant', processedResponse);
  await extractAndStoreMemory(context.userId, message, processedResponse);

  const insights = generateProactiveInsights(context, dashboardData);

  return {
    content: processedResponse,
    conversationId: effectiveConversationId,
    actions: actions.length > 0 ? actions : undefined,
    insights,
  };
}

// Specialized Agents
export async function studentAgent(
  message: string,
  context: AIContext,
  conversationId?: string
): Promise<AgentResponse & { conversationId: string }> {
  return masterAgent(message, { ...context, role: 'student' }, conversationId);
}

export async function parentAgent(
  message: string,
  context: AIContext,
  conversationId?: string
): Promise<AgentResponse & { conversationId: string }> {
  return masterAgent(message, { ...context, role: 'parent' }, conversationId);
}

export async function teacherAgent(
  message: string,
  context: AIContext,
  conversationId?: string
): Promise<AgentResponse & { conversationId: string }> {
  return masterAgent(message, { ...context, role: 'teacher' }, conversationId);
}

export async function recruiterAgent(
  message: string,
  context: AIContext,
  conversationId?: string
): Promise<AgentResponse & { conversationId: string }> {
  return masterAgent(message, { ...context, role: 'recruiter' }, conversationId);
}

export async function adminAgent(
  message: string,
  context: AIContext,
  conversationId?: string
): Promise<AgentResponse & { conversationId: string }> {
  return masterAgent(message, { ...context, role: 'admin' }, conversationId);
}

export function routeToAgent(context: AIContext): AgentHandler {
  const agentMap: Record<string, AgentHandler> = {
    student: (msg, ctx, hist) => studentAgent(msg, ctx, undefined),
    parent: (msg, ctx, hist) => parentAgent(msg, ctx, undefined),
    teacher: (msg, ctx, hist) => teacherAgent(msg, ctx, undefined),
    recruiter: (msg, ctx, hist) => recruiterAgent(msg, ctx, undefined),
    admin: (msg, ctx, hist) => adminAgent(msg, ctx, undefined),
    visitor: (msg, ctx, hist) => masterAgent(msg, ctx, undefined),
  };

  return agentMap[context.role] || masterAgent;
}
