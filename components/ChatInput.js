'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

export default function ChatInput({ onSend, disabled, placeholder = "Type your message..." }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    const cursorPosition = inputRef.current?.selectionStart || message.length;
    const newMessage = 
      message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    setMessage(newMessage);
    
    // Focus input and set cursor position after emoji
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPosition = cursorPosition + emoji.length;
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef}>
          <EmojiPicker 
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Emoji Button */}
      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="p-3.5 rounded-xl bg-[#1a1d29] border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-white"
        title="Add emoji"
      >
        <Smile size={20} />
      </button>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-5 py-3.5 rounded-xl bg-[#1a1d29] border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition text-white placeholder-gray-500 disabled:opacity-50"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-3.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Send size={20} />
      </button>
    </form>
  );
}
