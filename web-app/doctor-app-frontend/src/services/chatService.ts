import api from './api';

export interface ConversationDTO {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: string;
  doctorProfileId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string | null;
}

export interface ChatMessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export async function getConversations(): Promise<ConversationDTO[]> {
  const { data } = await api.get<ConversationDTO[]>('/api/chat/conversations');
  return data;
}

export async function getMessages(conversationId: string): Promise<ChatMessageDTO[]> {
  const { data } = await api.get<ChatMessageDTO[]>(`/api/chat/conversations/${conversationId}/messages`);
  return data;
}

export async function startConversation(doctorProfileId: string): Promise<ConversationDTO> {
  const { data } = await api.post<ConversationDTO>('/api/chat/conversations', { doctorProfileId });
  return data;
}

export async function markRead(conversationId: string): Promise<void> {
  await api.patch(`/api/chat/conversations/${conversationId}/read`);
}

export interface EligibleDoctorDTO {
  profileId: string;
  firstName: string;
  lastName: string;
  specialization: string | null;
}

export async function getEligibleDoctors(): Promise<EligibleDoctorDTO[]> {
  const { data } = await api.get<EligibleDoctorDTO[]>('/api/chat/eligible-doctors');
  return data;
}
