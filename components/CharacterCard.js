'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useCharacterStore from '@/store/characterStore';
import { getAvatarGradient } from '@/lib/utils/avatar';
import { MessageCircle, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CharacterCard({ character, onRefresh }) {
  const router = useRouter();
  const { removeCharacter } = useCharacterStore();
  const [loading, setLoading] = useState(false);

  const handleChat = () => {
    router.push(`/chat/${character.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete ${character.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      removeCharacter(character.id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete character:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-purple-500/30 transition cursor-pointer group"
      onClick={handleChat}
    >
      {/* Avatar */}
      <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${getAvatarGradient(character.name)} flex items-center justify-center text-2xl font-bold`}>
        {character.avatar_url ? (
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white">{character.name[0]}</span>
        )}
      </div>

      {/* Character Info */}
      <h3 className="text-lg font-semibold text-center mb-1 text-white">
        {character.name}
      </h3>
      
      {character.based_on_character && (
        <p className="text-xs text-center text-purple-400 mb-2">
          Based on {character.based_on_character}
        </p>
      )}

      <p className="text-xs text-gray-400 text-center mb-4 line-clamp-2">
        {character.personality}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleChat}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition"
        >
          <MessageCircle size={16} />
          Chat
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
