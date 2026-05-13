import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Avatar, Badge, TextField, IconButton, CircularProgress,
  List, ListItemButton, ListItemAvatar, ListItemText, Divider, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import DoctorPageLayout from '../../components/DoctorPageLayout';
import { C } from '../../styles/theme';
import {
  getConversations, getMessages, markRead,
  type ConversationDTO, type ChatMessageDTO,
} from '../../services/chatService';
import { useStompChat } from '../../hooks/useStompChat';
import { useToast } from '../../contexts/ToastContext';

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export default function DoctorChatPage() {
  const showToast = useToast();
  const myUserId = localStorage.getItem('userId') ?? '';

  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null;

  // Fetch conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      const convs = await getConversations();
      setConversations(convs);
    } catch {
      showToast('Failed to load conversations', 'error');
    } finally {
      setLoadingConvs(false);
    }
  }, [showToast]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConvId) { setMessages([]); return; }
    setLoadingMsgs(true);
    getMessages(selectedConvId)
      .then((msgs) => {
        setMessages(msgs);
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConvId ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch(() => showToast('Failed to load messages', 'error'))
      .finally(() => setLoadingMsgs(false));
  }, [selectedConvId, showToast]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // STOMP real-time
  const handleIncomingMessage = useCallback((msg: ChatMessageDTO) => {
    if (msg.conversationId === selectedConvId) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      markRead(msg.conversationId).catch(() => {});
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === msg.conversationId
          ? {
              ...c,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount: c.id === selectedConvId ? 0 : c.unreadCount + 1,
            }
          : c
      ).sort((a, b) => {
        const ta = a.lastMessageAt ?? a.createdAt ?? '';
        const tb = b.lastMessageAt ?? b.createdAt ?? '';
        return tb.localeCompare(ta);
      })
    );
  }, [selectedConvId]);

  const { sendMessage } = useStompChat({
    conversationId: selectedConvId,
    onMessage: handleIncomingMessage,
  });

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !selectedConvId) return;
    sendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chatContent = (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 52px - 80px)',
        borderRadius: '8px', overflow: 'hidden',
        border: `1px solid ${C.border}`,
      }}
    >
      {/* Conversation list */}
      <Box
        sx={{
          width: 270, flexShrink: 0,
          borderRight: `1px solid ${C.border}`,
          backgroundColor: C.surface,
          display: 'flex', flexDirection: 'column', height: '100%',
        }}
      >
        <Box sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: C.ink }}>
            Patient Conversations
          </Typography>
        </Box>

        {loadingConvs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress size={24} sx={{ color: C.blue }} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ChatBubbleOutlineIcon sx={{ color: C.subtle, fontSize: 36, mb: 1 }} />
            <Typography sx={{ color: C.muted, fontSize: '0.8125rem' }}>
              No patient conversations yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map((conv) => (
              <Box key={conv.id}>
                <ListItemButton
                  selected={conv.id === selectedConvId}
                  onClick={() => setSelectedConvId(conv.id)}
                  sx={{
                    px: 2, py: 1.25, alignItems: 'flex-start',
                    '&.Mui-selected': { backgroundColor: C.blueLight },
                    '&.Mui-selected:hover': { backgroundColor: C.blueLight },
                    '&:hover': { backgroundColor: C.borderSub },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 42 }}>
                    <Avatar sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: C.green, fontSize: '0.8125rem', fontWeight: 700 }}>
                      {getInitials(conv.otherUserName)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: conv.unreadCount > 0 ? 700 : 600, fontSize: '0.8125rem', color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                          {conv.otherUserName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: C.muted, flexShrink: 0, ml: 0.5 }}>
                          {formatTime(conv.lastMessageAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.25 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: conv.unreadCount > 0 ? C.inkMid : C.muted, fontWeight: conv.unreadCount > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {conv.lastMessage ?? 'No messages yet'}
                        </Typography>
                        {conv.unreadCount > 0 && (
                          <Badge badgeContent={conv.unreadCount}
                            sx={{ '& .MuiBadge-badge': { backgroundColor: C.blue, color: '#fff', fontSize: '0.6rem', minWidth: 17, height: 17 } }}
                          />
                        )}
                      </Box>
                    }
                    disableTypography
                  />
                </ListItemButton>
                <Divider component="li" sx={{ ml: 7, borderColor: C.border }} />
              </Box>
            ))}
          </List>
        )}
      </Box>

      {/* Message area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.paper }}>
        {!selectedConvId ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: '12px', backgroundColor: C.borderSub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 26, color: C.subtle }} />
            </Box>
            <Typography sx={{ color: C.inkMid, fontSize: '0.9375rem', fontWeight: 600 }}>
              Select a conversation
            </Typography>
          </Box>
        ) : (
          <>
            {/* Chat header */}
            <Box sx={{ px: 3, py: 1.75, borderBottom: `1px solid ${C.border}`, backgroundColor: C.paper, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              <Avatar sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: C.green, fontSize: '0.8125rem', fontWeight: 700 }}>
                {getInitials(selectedConv?.otherUserName ?? '')}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: C.ink }}>
                  {selectedConv?.otherUserName}
                </Typography>
                <Chip label="Patient" size="small"
                  sx={{ height: 17, fontSize: '0.6rem', backgroundColor: C.greenBg, color: C.green, fontWeight: 600, mt: 0.25 }}
                />
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: C.surface }}>
              {loadingMsgs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <CircularProgress size={24} sx={{ color: C.blue }} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', pt: 6 }}>
                  <Typography sx={{ color: C.muted, fontSize: '0.875rem' }}>No messages yet.</Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === myUserId;
                  return (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <Box sx={{
                        maxWidth: '68%', px: 2, py: 1.25,
                        borderRadius: isMine ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                        backgroundColor: isMine ? C.blue : C.paper,
                        color: isMine ? '#fff' : C.ink,
                        border: isMine ? 'none' : `1px solid ${C.border}`,
                      }}>
                        <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.55, wordBreak: 'break-word' }}>
                          {msg.content}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', mt: 0.5, textAlign: 'right', color: isMine ? 'rgba(255,255,255,0.65)' : C.muted }}>
                          {formatTime(msg.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ px: 2.5, py: 1.75, borderTop: `1px solid ${C.border}`, backgroundColor: C.paper, display: 'flex', gap: 1.25, alignItems: 'flex-end', flexShrink: 0 }}>
              <TextField
                fullWidth multiline maxRows={4} size="small"
                placeholder="Type a message…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px', backgroundColor: C.surface, fontSize: '0.875rem',
                    '& fieldset': { borderColor: C.border },
                    '&:hover fieldset': { borderColor: C.subtle },
                    '&.Mui-focused fieldset': { borderColor: C.blue },
                  },
                }}
              />
              <IconButton onClick={handleSend} disabled={!inputText.trim()}
                sx={{
                  backgroundColor: C.blue, color: '#fff',
                  width: 38, height: 38, borderRadius: '8px', flexShrink: 0,
                  '&:hover': { backgroundColor: C.blueDark },
                  '&.Mui-disabled': { backgroundColor: C.borderSub, color: C.muted },
                }}>
                <SendIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <DoctorPageLayout title="Chat" subtitle="Communicate with your patients in real time">
      {chatContent}
    </DoctorPageLayout>
  );
}
