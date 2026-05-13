import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Avatar, Badge, TextField, IconButton, CircularProgress,
  List, ListItemButton, ListItemAvatar, ListItemText, Divider, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import DoctorPageLayout from '../../components/DoctorPageLayout';
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
        height: 'calc(100vh - 64px - 80px)',
        backgroundColor: '#f4f6fb',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Conversation list */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <Typography sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#002045' }}>
            Patient Conversations
          </Typography>
        </Box>

        {loadingConvs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress size={28} sx={{ color: '#0061a5' }} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ChatBubbleOutlineIcon sx={{ color: '#94a3b8', fontSize: 40, mb: 1 }} />
            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', fontFamily: 'Manrope, sans-serif' }}>
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
                    px: 2,
                    py: 1.5,
                    alignItems: 'flex-start',
                    '&.Mui-selected': { backgroundColor: '#eff6ff' },
                    '&.Mui-selected:hover': { backgroundColor: '#eff6ff' },
                    '&:hover': { backgroundColor: '#f8fafc' },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar sx={{ width: 40, height: 40, backgroundColor: '#2d476f', fontSize: '0.875rem', fontWeight: 700 }}>
                      {getInitials(conv.otherUserName)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: conv.unreadCount > 0 ? 700 : 600,
                            fontSize: '0.875rem',
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 120,
                          }}
                        >
                          {conv.otherUserName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0, ml: 0.5 }}>
                          {formatTime(conv.lastMessageAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.25 }}>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            color: conv.unreadCount > 0 ? '#475569' : '#94a3b8',
                            fontWeight: conv.unreadCount > 0 ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 140,
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {conv.lastMessage ?? 'No messages yet'}
                        </Typography>
                        {conv.unreadCount > 0 && (
                          <Badge
                            badgeContent={conv.unreadCount}
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: '#0061a5',
                                color: '#fff',
                                fontSize: '0.65rem',
                                minWidth: 18,
                                height: 18,
                              },
                            }}
                          />
                        )}
                      </Box>
                    }
                    disableTypography
                  />
                </ListItemButton>
                <Divider component="li" sx={{ ml: 7 }} />
              </Box>
            ))}
          </List>
        )}
      </Box>

      {/* Message area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f4f6fb' }}>
        {!selectedConvId ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
            <Typography sx={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif', fontSize: '1.125rem', fontWeight: 600 }}>
              Select a conversation
            </Typography>
          </Box>
        ) : (
          <>
            {/* Chat header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexShrink: 0,
              }}
            >
              <Avatar sx={{ width: 38, height: 38, backgroundColor: '#2d476f', fontSize: '0.875rem', fontWeight: 700 }}>
                {getInitials(selectedConv?.otherUserName ?? '')}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b' }}>
                  {selectedConv?.otherUserName}
                </Typography>
                <Chip
                  label="Patient"
                  size="small"
                  sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: 600 }}
                />
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loadingMsgs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <CircularProgress size={28} sx={{ color: '#0061a5' }} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', pt: 6 }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    No messages yet.
                  </Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === myUserId;
                  return (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <Box
                        sx={{
                          maxWidth: '70%',
                          px: 2,
                          py: 1.25,
                          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          backgroundColor: isMine ? '#0061a5' : '#ffffff',
                          color: isMine ? '#ffffff' : '#1e293b',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.5, fontFamily: 'Inter, sans-serif', wordBreak: 'break-word' }}>
                          {msg.content}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            mt: 0.5,
                            color: isMine ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                            textAlign: 'right',
                          }}
                        >
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
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-end',
                flexShrink: 0,
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={4}
                size="small"
                placeholder="Type a message…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8fafc',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!inputText.trim()}
                sx={{
                  backgroundColor: '#0061a5',
                  color: '#fff',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  '&:hover': { backgroundColor: '#004f87' },
                  '&.Mui-disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' },
                }}
              >
                <SendIcon sx={{ fontSize: 18 }} />
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
