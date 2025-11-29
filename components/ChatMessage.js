'use client';

import { motion } from 'framer-motion';

export default function ChatMessage({ message, characterName }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-2xl p-4 ${
          isUser
            ? 'bg-neon-blue/20 border border-neon-blue/50 ml-auto'
            : 'glass-effect border border-neon-purple/50'
        }`}
      >
        <div className="text-xs font-semibold mb-2 opacity-70">
          {isUser ? 'You' : characterName}
        </div>
        <div className="text-white whitespace-pre-wrap">{message.content}</div>
      </div>
    </motion.div>
  );
}
