import api from './api';

export async function explainDocument(file: File, language: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ explanation: string }>(`/api/ai/explain?language=${encodeURIComponent(language)}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.explanation;
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export async function sendChatMessage(history: ChatMessage[]): Promise<string> {
  const res = await api.post<{ reply: string }>('/api/ai/chat', history);
  return res.data.reply;
}
