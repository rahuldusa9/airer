'use client';

import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import useCharacterStore from '@/store/characterStore';
import { X } from 'lucide-react';

const FAMOUS_CHARACTERS = [
  'Tony Stark (Iron Man)',
  'Sherlock Holmes',
  'Yoda',
  'Albert Einstein',
  'Hermione Granger',
  'Deadpool',
  'Wednesday Addams',
  'Gandalf',
  'Rick Sanchez',
  'Eleven (Stranger Things)',
];

export default function CreateCharacterModal({ onClose, onSuccess }) {
  const { user } = useAuthStore();
  const { addCharacter } = useCharacterStore();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    system_prompt: '',
    tone: 5,
    humor: 5,
    formality: 5,
    creativity: 5,
    empathy: 5,
    based_on_character: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          avatar_url: '',
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      const { character } = await response.json();
      addCharacter(character);
      onSuccess(character);
      onClose();
    } catch (error) {
      console.error('Failed to create character:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-effect rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto neon-border border-neon-purple">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold glow-text text-neon-purple">
            Create AI Character
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neon-blue">
              Character Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-blue/30 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition"
              placeholder="Enter character name"
              required
            />
          </div>

          {/* Based On */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neon-purple">
              Based On Famous Character (Optional)
            </label>
            <select
              value={formData.based_on_character}
              onChange={(e) => handleChange('based_on_character', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-purple/30 focus:border-neon-purple focus:outline-none transition"
            >
              <option value="">None - Original Character</option>
              {FAMOUS_CHARACTERS.map((char) => (
                <option key={char} value={char}>
                  {char}
                </option>
              ))}
            </select>
          </div>

          {/* Personality */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neon-blue">
              Personality Description *
            </label>
            <textarea
              value={formData.personality}
              onChange={(e) => handleChange('personality', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-blue/30 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition"
              placeholder="Describe the character's personality, traits, and behavior..."
              rows={4}
              required
            />
          </div>

          {/* Advanced Options Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-neon-purple hover:text-neon-pink transition"
            >
              <span className="text-sm font-medium">
                {showAdvanced ? '▼' : '▶'} Advanced Options
              </span>
            </button>
          </div>

          {/* Advanced Options - Collapsible */}
          {showAdvanced && (
            <div className="space-y-6 p-4 rounded-lg bg-black/30 border border-neon-purple/20">
              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neon-green">
                  System Instructions (Optional)
                </label>
                <textarea
                  value={formData.system_prompt}
                  onChange={(e) => handleChange('system_prompt', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-green/30 focus:border-neon-green focus:outline-none transition"
                  placeholder="Additional instructions for how the AI should behave..."
                  rows={3}
                />
              </div>

              {/* Personality Sliders */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neon-pink">
                  Personality Traits
                </h3>

                {/* Humor */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Humor</label>
                    <span className="text-neon-purple font-semibold">
                      {formData.humor}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.humor}
                    onChange={(e) => handleChange('humor', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Serious</span>
                    <span>Playful</span>
                  </div>
                </div>

                {/* Formality */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Formality</label>
                    <span className="text-neon-pink font-semibold">
                      {formData.formality}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.formality}
                    onChange={(e) => handleChange('formality', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Casual</span>
                    <span>Formal</span>
                  </div>
                </div>

                {/* Creativity */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Creativity</label>
                    <span className="text-neon-green font-semibold">
                      {formData.creativity}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.creativity}
                    onChange={(e) => handleChange('creativity', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Practical</span>
                    <span>Imaginative</span>
                  </div>
                </div>

                {/* Empathy */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Empathy</label>
                    <span className="text-neon-blue font-semibold">
                      {formData.empathy}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.empathy}
                    onChange={(e) => handleChange('empathy', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Cool</span>
                    <span>Caring</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-neon-purple text-white font-semibold hover:bg-neon-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
          >
            {loading ? 'Creating...' : 'Create Character'}
          </button>
        </form>
      </div>
    </div>
  );
}
