import { NextRequest } from 'next/server';
import { routeToAgent, masterAgent } from '@/lib/ai/agents';
import { parseContextFromHeaders } from '@/lib/ai/context';
import { isAIEnabled } from '@/lib/ai/provider';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import { getMemory, getConversationHistory, saveMessage } from '@/lib/ai/memory';
import { buildContextString, fetchDashboardData } from '@/lib/ai/context';
import { getToolDefinitionsForSystemPrompt } from '@/lib/ai/tools';
import { generateChatCompletionStream } from '@/lib/ai/provider';
import type { AIContext } from '@/types/ai';

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { status: 503 });
    }

    const body = await request.json();
    const { message, conversationId, context: clientContext } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    const page = request.headers.get('referer') || clientContext?.page || '/';
    const partialContext = parseContextFromHeaders(page, clientContext?.role);

    const context: AIContext = {
      userId: clientContext?.userId || partialContext.userId || 'anonymous',
      role: clientContext?.role || partialContext.role || 'student',
      page: clientContext?.page || partialContext.page || '/',
      portal: clientContext?.portal || partialContext.portal || 'unknown',
      schoolId: clientContext?.schoolId,
      studentId: clientContext?.studentId,
      parentId: clientContext?.parentId,
      teacherId: clientContext?.teacherId,
      recruiterId: clientContext?.recruiterId,
      adminId: clientContext?.adminId,
      classId: clientContext?.classId,
      jobId: clientContext?.jobId,
      sessionId: clientContext?.sessionId || `sess-${Date.now()}`,
      data: clientContext?.data,
    };

    const dashboardData = await fetchDashboardData(context);
    const contextStr = buildContextString({ ...context, data: { ...(context.data || {}), ...dashboardData } });
    const memory = await getMemory(context.userId);
    const toolsAvailable = getToolDefinitionsForSystemPrompt(context.role);
    const systemPrompt = buildSystemPrompt(context, memory, contextStr) +
      (toolsAvailable ? `\n\nAvailable Tools (respond with [ACTION: tool_name] to execute):\n${toolsAvailable}` : '');

    const history = conversationId ? await getConversationHistory(conversationId) : [];
    const aiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ];

    const stream = await generateChatCompletionStream(aiMessages);

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            fullText += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }

          const effConversationId = conversationId || `conv-${Date.now()}`;
          await saveMessage(effConversationId, 'user', message);
          await saveMessage(effConversationId, 'assistant', fullText);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: effConversationId })}\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error', text: '' })}\n\n`));
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500 });
  }
}
