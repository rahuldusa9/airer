'use client';

import { useState } from 'react';
import { Smile, Clock, Activity, Heart, Coffee, Flag } from 'lucide-react';

const emojiCategories = {
  recent: {
    icon: Clock,
    label: 'Recent',
    emojis: ['😊', '❤️', '👍', '😂', '🎉', '🔥', '💯', '✨']
  },
  smileys: {
    icon: Smile,
    label: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
      '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
      '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
      '🤨', '🧐', '🤓', '😎', '🥳', '🤩', '😏', '😒',
      '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫',
      '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
    ]
  },
  gestures: {
    icon: Activity,
    label: 'Gestures',
    emojis: [
      '👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤏', '✌️',
      '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
      '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾'
    ]
  },
  hearts: {
    icon: Heart,
    label: 'Hearts',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗',
      '💖', '💘', '💝', '💟', '♥️', '💌', '💋', '😻'
    ]
  },
  objects: {
    icon: Coffee,
    label: 'Objects',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
      '⚽', '🏀', '🏈', '⚾', '🎾', '🎮', '🎯', '🎲',
      '🎸', '🎹', '🎤', '🎧', '🎬', '📱', '💻', '⌨️',
      '🖱️', '💾', '💿', '📷', '📹', '🔋', '💡', '🔦'
    ]
  },
  flags: {
    icon: Flag,
    label: 'Flags',
    emojis: [
      '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '🇺🇳',
      '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇮🇳', '🇨🇳', '🇯🇵', '🇰🇷',
      '🇧🇷', '🇲🇽', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇷🇺', '🇿🇦'
    ]
  }
};

export default function EmojiPicker({ onEmojiSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const categories = Object.keys(emojiCategories);

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-[#252836] rounded-lg shadow-2xl border border-white/10 overflow-hidden">
      {/* Emoji Grid */}
      <div className="h-64 overflow-y-auto p-4">
        <div className="grid grid-cols-8 gap-2">
          {emojiCategories[activeCategory].emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="text-2xl hover:bg-white/10 rounded p-1 transition"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-t border-white/10 bg-[#1a1d29] flex items-center justify-around p-2">
        {categories.map((category) => {
          const Icon = emojiCategories[category].icon;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`p-2 rounded-lg transition ${
                activeCategory === category
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={emojiCategories[category].label}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
