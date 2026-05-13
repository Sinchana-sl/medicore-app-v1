import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Badge, TextField, IconButton, CircularProgress,
  List, ListItemButton, ListItemAvatar, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddCommentIcon from '@mui/icons-material/AddComment';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import TopNavBar from '../components/TopNavBar';
import SideNavBar from '../components/SideNavBar';
import ChatBot from '../components/ChatBot';
import { getPatientProfile, type PatientProfile } from '../services/patientService';
import {
  getConversations, getMessages, startConversation, markRead, getEligibleDoctors,
  type ConversationDTO, type ChatMessageDTO, type EligibleDoctorDTO,
} from '../services/chatService';
import { useStompChat } from '../hooks/useStompChat';
import { useToast } from '../contexts/ToastContext';

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

export default function PatientChatPage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const myUserId = localStorage.getItem('userId') ?? '';

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // New chat dialog
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [eligibleDoctors, setEligibleDoctors] = useState<EligibleDoctorDTO[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [startingConv, setStartingConv] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null;

  // Fetch profile for NavBar
  useEffect(() => {
    getPatientProfile().then(setProfile).catch(() => {});
  }, []);

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
        // Update unread count in sidebar
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
        // avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Mark as read immediately since window is open
      markRead(msg.conversationId).catch(() => {});
    }
    // Update last message in sidebar
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

  // Load eligible doctors when dialog opens
  useEffect(() => {
    if (!newChatOpen) return;
    setLoadingEligible(true);
    getEligibleDoctors()
      .then(setEligibleDoctors)
      .catch(() => showToast('Failed to load doctors', 'error'))
      .finally(() => setLoadingEligible(false));
  }, [newChatOpen, showToast]);

  const handleStartConversation = async (doctor: EligibleDoctorDTO) => {
    setStartingConv(true);
    try {
      const conv = await startConversation(doctor.profileId);
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      setSelectedConvId(conv.id);
      setNewChatOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start conversation';
      showToast(msg, 'error');
    } finally {
      setStartingConv(false);
    }
  };

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email
    : '';

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <TopNavBar
        displayName={displayName}
        email={profile?.email}
        onProfileClick={() => navigate('/settings')}
      />
      <Box sx={{ display: 'flex' }}>
        <SideNavBar />

        {/* Main chat area */}
        <Box
          component="main"
          sx={{
            ml: '240px',
            flex: 1,
            display: 'flex',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
          }}
        >
          {/* Conversation list panel */}
          <Box
            sx={{
              width: 300,
              flexShrink: 0,
              borderRight: '1px solid #E9E9E7',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: '1px solid #E9E9E7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '1.125rem', color: '#37352F' }}
              >
                Messages
              </Typography>
              <IconButton
                size="small"
                onClick={() => setNewChatOpen(true)}
                sx={{ color: '#0D9488', '&:hover': { backgroundColor: '#eff6ff' } }}
              >
                <AddCommentIcon />
              </IconButton>
            </Box>

            {/* Conversation items */}
            {loadingConvs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress size={28} sx={{ color: '#0D9488' }} />
              </Box>
            ) : conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <ChatBubbleOutlineIcon sx={{ color: '#94a3b8', fontSize: 40, mb: 1 }} />
                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', fontFamily: 'inherit' }}>
                  No conversations yet
                </Typography>
                <Button
                  startIcon={<AddCommentIcon />}
                  size="small"
                  onClick={() => setNewChatOpen(true)}
                  sx={{ mt: 1.5, color: '#0D9488', fontFamily: 'inherit', textTransform: 'none', fontWeight: 600 }}
                >
                  Start a chat
                </Button>
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
                        '&:hover': { backgroundColor: '#F7F7F5' },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#0D9488',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(conv.otherUserName)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography
                              sx={{
                                fontFamily: 'inherit',
                                fontWeight: conv.unreadCount > 0 ? 700 : 600,
                                fontSize: '0.875rem',
                                color: '#1e293b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 140,
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
                                maxWidth: 160,
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
                                    backgroundColor: '#0D9488',
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
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              backgroundColor: '#FFFFFF',
            }}
          >
            {!selectedConvId ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
                <Typography sx={{ color: '#94a3b8', fontFamily: 'inherit', fontSize: '1.125rem', fontWeight: 600 }}>
                  Select a conversation
                </Typography>
                <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                  or start a new chat with your doctor
                </Typography>
              </Box>
            ) : (
              <>
                {/* Chat header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid #E9E9E7',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexShrink: 0,
                  }}
                >
                  <Avatar sx={{ width: 38, height: 38, backgroundColor: '#0D9488', fontSize: '0.875rem', fontWeight: 700 }}>
                    {getInitials(selectedConv?.otherUserName ?? '')}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b' }}>
                      {selectedConv?.otherUserName}
                    </Typography>
                    <Chip
                      label="Doctor"
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#eff6ff', color: '#0D9488', fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                {/* Messages */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {loadingMsgs ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                      <CircularProgress size={28} sx={{ color: '#0D9488' }} />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', pt: 6 }}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        No messages yet. Say hello!
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId === myUserId;
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isMine ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              px: 2,
                              py: 1.25,
                              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              backgroundColor: isMine ? '#0D9488' : '#ffffff',
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
                    borderTop: '1px solid #E9E9E7',
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
                        borderRadius: '8px',
                        backgroundColor: '#F7F7F5',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    sx={{
                      backgroundColor: '#0D9488',
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
      </Box>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'inherit', fontWeight: 700, color: '#37352F' }}>
          New Conversation
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 2, fontFamily: 'Inter, sans-serif' }}>
            You can message doctors you've had a confirmed in-person appointment with.
          </Typography>
          {loadingEligible ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} sx={{ color: '#0D9488' }} />
            </Box>
          ) : eligibleDoctors.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#94a3b8', py: 3, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
              No eligible doctors found. Book an in-person appointment first.
            </Typography>
          ) : (
            <List disablePadding>
              {eligibleDoctors.map((doc) => (
                <ListItemButton
                  key={doc.profileId}
                  onClick={() => handleStartConversation(doc)}
                  disabled={startingConv}
                  sx={{ borderRadius: '6px', mb: 0.5, border: '1px solid #E9E9E7' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#0D9488', fontWeight: 700 }}>
                      {getInitials(`${doc.firstName} ${doc.lastName}`)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem' }}>
                        Dr. {doc.firstName} {doc.lastName}
                      </Typography>
                    }
                    secondary={doc.specialization ?? 'General Practitioner'}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewChatOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI ChatBot FAB */}
      <ChatBot onAppointmentBooked={() => {}} />
    </Box>
  );
}
