import { createServerClient } from '../supabase/server';
import type { AIMemory } from '../../types/ai';

export async function getMemory(userId: string): Promise<string> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('ai_memory')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (!data || data.length === 0) return '';

  const memoryString = data.map(m =>
    `- ${m.type}: ${m.key} = ${m.value}`
  ).join('\n');

  return memoryString;
}

export async function storeMemory(
  userId: string,
  key: string,
  value: string,
  type: AIMemory['type']
): Promise<void> {
  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from('ai_memory')
    .select('id')
    .eq('user_id', userId)
    .eq('key', key)
    .single();

  if (existing) {
    await supabase
      .from('ai_memory')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('ai_memory')
      .insert({
        user_id: userId,
        key,
        value,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  }
}

export async function extractAndStoreMemory(
  userId: string,
  message: string,
  response: string
): Promise<void> {
  const preferences = extractPreferences(message, response);
  for (const [key, value] of Object.entries(preferences)) {
    await storeMemory(userId, key, value as string, 'preference');
  }

  const goals = extractGoals(message, response);
  for (const goal of goals) {
    await storeMemory(userId, `goal_${Date.now()}`, goal, 'goal');
  }
}

function extractPreferences(_message: string, response: string): Record<string, string> {
  const prefs: Record<string, string> = {};

  const subjectMatch = response.match(/I (?:see|notice) you(?:'re)? (?:interested in|studying|working on) (\w+)/i);
  if (subjectMatch) prefs.current_subject = subjectMatch[1];

  return prefs;
}

function extractGoals(_message: string, response: string): string[] {
  const goals: string[] = [];

  const goalMatch = response.match(/(?:goal|aim|target|want to|plan to) ([^.!]+)/gi);
  if (goalMatch) {
    goalMatch.forEach(g => goals.push(g.trim()));
  }

  return goals;
}

export async function getConversationHistory(
  conversationId: string
): Promise<{ role: string; content: string }[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (!data) return [];
  return data.map(m => ({ role: m.role, content: m.content }));
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string
): Promise<void> {
  const supabase = await createServerClient();
  await supabase.from('conversation_messages').insert({
    conversation_id: conversationId,
    role,
    content,
    created_at: new Date().toISOString(),
  });
}

export async function createConversation(
  userId: string,
  role: string,
  sessionId: string,
  title: string
): Promise<string> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('conversations').insert({
    user_id: userId,
    role,
    session_id: sessionId,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select('id').single();

  if (error || !data) throw new Error('Failed to create conversation');
  return data.id;
}
