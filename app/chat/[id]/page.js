'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { exportToWhatsApp, copyToClipboard, shareViaWhatsApp } from '@/lib/utils/export';
import { getAvatarGradient } from '@/lib/utils/avatar';
import useAuthStore from '@/store/authStore';
import useChatStore from '@/store/chatStore';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft, Trash2, Download, Share2, User, MessageSquare, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const characterId = params.id;
  const { user, setUser } = useAuthStore();
  const { messages, setMessages, addMessage, updateLastMessage, setStreaming, clearMessages } = useChatStore();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [characterThoughts, setCharacterThoughts] = useState('');
  const [loadingThoughts, setLoadingThoughts] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        
        if (!response.ok || !data.valid) {
          router.push('/auth/login');
          return;
        }

        setUser({ id: data.userId, username: data.username, email: data.email });
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, setUser]);

  useEffect(() => {
    if (user && characterId) {
      loadChat();
    }
  }, [user, characterId, loadChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = useCallback(async () => {
    if (!user) {
      console.log('Waiting for user...');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const [charResponse, messagesResponse] = await Promise.all([
        fetch(`/api/characters/${characterId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/messages?characterId=${characterId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const { character: charData } = await charResponse.json();
      const { messages: messagesData } = await messagesResponse.json();
      
      setCharacter(charData);
      setMessages(messagesData || []);
      
      // Load character thoughts if there are messages
      if (messagesData && messagesData.length > 0) {
        loadCharacterThoughts(charData, messagesData);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  }, [user, characterId]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || !character) return;

    const timestamp = Date.now();
    const userMessage = {
      id: `user-${timestamp}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    addMessage(userMessage);

    const assistantMessage = {
      id: `assistant-${timestamp}`,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    addMessage(assistantMessage);
    setStreaming(true);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          userId: user.id,
          message: content,
          character
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Update assistant message with reply
      updateLastMessage(data.reply);

      // Reload messages from database
      const token = localStorage.getItem('auth_token');
      const messagesResponse = await fetch(`/api/messages?characterId=${characterId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { messages: messagesData } = await messagesResponse.json();
      setMessages(messagesData || []);
      
      // Update character thoughts after new message
      if (messagesData && messagesData.length > 0) {
        loadCharacterThoughts(character, messagesData);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      updateLastMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      setStreaming(false);
    }
  };

  const loadCharacterThoughts = async (char, msgs) => {
    if (!char || !msgs || msgs.length === 0) return;
    
    try {
      setLoadingThoughts(true);
      const response = await fetch('/api/character-thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: char.id || char._id,
          characterName: char.name,
          userId: user.id,
          messages: msgs.slice(-10) // Last 10 messages
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCharacterThoughts(data.thoughts);
      }
    } catch (error) {
      console.error('Failed to load character thoughts:', error);
    } finally {
      setLoadingThoughts(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Are you sure you want to clear this chat? This will delete all messages and memories.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/messages/clear?characterId=${characterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      clearMessages();
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const handleExport = async () => {
    const whatsappText = exportToWhatsApp(messages, character.name);
    await copyToClipboard(whatsappText);
  };

  const handleShare = () => {
    const whatsappText = exportToWhatsApp(messages, character.name);
    shareViaWhatsApp(whatsappText);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1d29]">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1d29]">
        <div className="text-red-400">Character not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#1a1d29] text-white overflow-hidden">
      {/* Desktop Left Sidebar - Hidden on mobile */}
      <div className="hidden md:flex w-20 bg-[#7c3aed] flex-col items-center py-6 space-y-6">
        <button 
          onClick={() => router.push('/dashboard')}
          className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        >
          <ArrowLeft size={20} />
        </button>
        
        <button className="w-12 h-12 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        <div className="flex-1"></div>

        <div className="w-12 flex justify-center mb-2">
          <ThemeToggle />
        </div>

        <button 
          onClick={handleClearChat}
          className="w-12 h-12 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
          title="Clear chat"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Character Info Sidebar - Hidden on mobile */}
      <div className="hidden md:flex w-80 bg-[#252836] border-r border-white/5 flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(character?.name)} flex items-center justify-center text-2xl font-bold`}>
                {character?.avatar_url ? (
                  <img src={character.avatar_url} alt={character.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  character?.name?.[0] || '?'
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#252836]"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold">{character?.name || 'Loading...'}</h2>
              <p className="text-sm text-gray-400">Online</p>
            </div>
          </div>
          
          {character?.based_on_character && (
            <div className="text-xs text-gray-400 mb-2">
              Based on: <span className="text-purple-400">{character.based_on_character}</span>
            </div>
          )}
          
          {character?.personality && (
            <p className="text-sm text-gray-300">{character.personality}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">About</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <p className="text-xs text-gray-500 mb-1">Personality Traits</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                  Humor: {character?.humor_level || 50}%
                </span>
                <span className="px-2 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs">
                  Formality: {character?.formality_level || 50}%
                </span>
                <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                  Creativity: {character?.creativity_level || 50}%
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Message Count</p>
              <p className="text-gray-300">{messages.length} messages</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-gray-300">
                {character?.created_at ? new Date(character.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Character Thoughts Section */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Character&apos;s Perspective
            </h3>
            <div className="bg-[#1a1d29] rounded-lg p-4 border border-white/5">
              {loadingThoughts ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                </div>
              ) : characterThoughts ? (
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  &ldquo;{characterThoughts}&rdquo;
                </p>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Start chatting to see {character?.name}&apos;s thoughts about you
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#1a1d29] pb-20 md:pb-0">
        {/* Chat Header */}
        <div className="h-16 bg-[#252836] border-b border-white/5 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <button 
              onClick={() => router.push('/dashboard')}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold">{character?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              className="p-2 hover:bg-white/5 rounded-lg transition hidden md:block"
              title="Export to WhatsApp"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-white/5 rounded-lg transition"
              title="Share via WhatsApp"
            >
              <Share2 size={20} />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 md:px-6 text-center">
              <div className={`w-20 h-20 mb-6 rounded-full bg-gradient-to-br ${getAvatarGradient(character?.name)} flex items-center justify-center`}>
                <MessageSquare size={36} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-gray-400 max-w-md">
                Say hello to {character?.name}! They&apos;re ready to chat with you about anything.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4 md:p-6 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : `bg-gradient-to-br ${getAvatarGradient(character?.name)}`
                  }`}>
                    {msg.role === 'user' ? (
                      <User size={20} />
                    ) : (
                      character?.name?.[0] || 'A'
                    )}
                  </div>
                  <div className={`flex flex-col max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#7c3aed] text-white rounded-tr-sm'
                        : 'bg-[#2d3142] text-white rounded-tl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-[#252836] border-t border-white/5 p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              disabled={sending}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#7c3aed] border-t border-white/10 safe-area-inset-bottom z-50">
        <div className="flex items-center justify-around px-2 py-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <ArrowLeft size={20} />
            <span className="text-xs">Back</span>
          </button>
          
          <button 
            onClick={handleExport}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <Download size={20} />
            <span className="text-xs">Export</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <Share2 size={20} />
            <span className="text-xs">Share</span>
          </button>

          <div className="flex flex-col items-center gap-1">
            <ThemeToggle />
            <span className="text-xs">Theme</span>
          </div>

          <button 
            onClick={handleClearChat}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <Trash2 size={20} />
            <span className="text-xs">Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}
