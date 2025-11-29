'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useCharacterStore from '@/store/characterStore';
import { getAvatarGradient } from '@/lib/utils/avatar';
import CharacterCard from '@/components/CharacterCard';
import CreateCharacterModal from '@/components/CreateCharacterModal';
import ThemeToggle from '@/components/ThemeToggle';
import { LogOut, Plus, Trash2, Home, MessageSquare, Users, Search, BarChart3, TrendingUp, Zap } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const { characters, setCharacters, setLoading } = useCharacterStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

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
    if (user) {
      loadCharacters();
      loadStats();
    }
  }, [user]);

  const loadStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/characters', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const { characters } = await response.json();
        setCharacters(characters);
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('auth_token');
    logout();
    router.push('/auth/login');
  };

  const handleDelete = useCallback(async (characterId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadCharacters();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }, [loadCharacters]);

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.personality?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#1a1d29] text-white overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex w-20 bg-[#7c3aed] flex-col items-center py-6 space-y-6">
        <button 
          onClick={() => setShowStats(false)}
          className={`w-12 h-12 rounded-lg ${!showStats ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'} flex items-center justify-center transition`}
          title="Home"
        >
          <Home size={20} />
        </button>
        
        <button 
          onClick={() => setShowStats(true)}
          className={`w-12 h-12 rounded-lg ${showStats ? 'bg-white/20' : 'hover:bg-white/10'} flex items-center justify-center transition`}
          title="Statistics"
        >
          <BarChart3 size={20} />
        </button>

        <button 
          className="w-12 h-12 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
          title="All Chats"
        >
          <MessageSquare size={20} />
        </button>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
          title="Characters"
        >
          <Users size={20} />
        </button>

        <div className="flex-1"></div>

        <div className="w-12 flex justify-center">
          <ThemeToggle />
        </div>

        <button 
          onClick={handleLogout}
          className="w-12 h-12 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Character List Sidebar - Hidden on mobile, shown as drawer */}
      <div className="hidden md:flex w-80 bg-[#252836] border-r border-white/5 flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1d29] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCharacters.length === 0 ? (
            <div className="p-6 text-center">
              {searchQuery ? (
                <>
                  <p className="text-sm text-gray-400 mb-3">No characters found</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Plus size={28} className="text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-3">No characters yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Create your first AI friend
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredCharacters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => router.push(`/chat/${character.id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1d29] cursor-pointer transition group"
                >
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(character.name)} flex items-center justify-center text-2xl font-bold`}>
                      {character.avatar_url ? (
                        <img src={character.avatar_url} alt={character.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        character.name[0]
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#252836]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-medium truncate">{character.name}</h3>
                      <span className="text-xs text-gray-500">
                        {character.created_at ? new Date(character.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{character.personality}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${character.name}?`)) {
                        handleDelete(character.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-medium transition"
          >
            <Plus size={18} />
            New Character
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#1a1d29] to-[#252836] overflow-y-auto pb-20 md:pb-0">
        {showStats && stats ? (
          /* Statistics View */
          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Statistics</h2>
              <p className="text-gray-400">Track your activity and engagement</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Characters */}
              <div className="bg-[#252836] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="text-purple-400" size={24} />
                  </div>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.totalCharacters}</h3>
                <p className="text-sm text-gray-400">AI Characters</p>
              </div>

              {/* Total Messages */}
              <div className="bg-[#252836] border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="text-blue-400" size={24} />
                  </div>
                  <span className="text-xs text-gray-500">Sent</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.totalMessages}</h3>
                <p className="text-sm text-gray-400">Messages Sent</p>
              </div>

              {/* Total Conversations */}
              <div className="bg-[#252836] border border-white/10 rounded-xl p-6 hover:border-green-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.totalConversations}</h3>
                <p className="text-sm text-gray-400">Conversations</p>
              </div>

              {/* Memories */}
              <div className="bg-[#252836] border border-white/10 rounded-xl p-6 hover:border-pink-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Zap className="text-pink-400" size={24} />
                  </div>
                  <span className="text-xs text-gray-500">Stored</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.totalMemories}</h3>
                <p className="text-sm text-gray-400">Memories</p>
              </div>
            </div>

            {/* Activity Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Active Character */}
              <div className="bg-[#252836] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-purple-400" size={20} />
                  Most Active Character
                </h3>
                {stats.mostActiveCharacter ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                      {stats.mostActiveCharacter.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{stats.mostActiveCharacter.name}</p>
                      <p className="text-sm text-gray-400">
                        {stats.mostActiveCharacter.messageCount} messages
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No activity yet</p>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-[#252836] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="text-blue-400" size={20} />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last 7 days</span>
                    <span className="text-2xl font-bold">{stats.recentMessages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg per character</span>
                    <span className="text-2xl font-bold">{stats.avgMessagesPerCharacter}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowStats(false)}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-medium transition"
              >
                Back to Characters
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition"
              >
                Create New Character
              </button>
            </div>
          </div>
        ) : (
          /* Character Grid View for Mobile */
          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Your AI Characters</h2>
              <p className="text-gray-400">@{user?.username || user?.email}</p>
            </div>

            {/* Mobile Search Bar */}
            <div className="mb-6 md:hidden">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#252836] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/10"
                />
                <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#252836] border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats.totalCharacters}</p>
                  <p className="text-xs text-gray-500 mt-1">Characters</p>
                </div>
                <div className="bg-[#252836] border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.totalMessages}</p>
                  <p className="text-xs text-gray-500 mt-1">Messages</p>
                </div>
                <div className="bg-[#252836] border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-pink-400">{stats.totalMemories}</p>
                  <p className="text-xs text-gray-500 mt-1">Memories</p>
                </div>
              </div>
            )}

            {/* Character Grid */}
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <MessageSquare size={36} />
                </div>
                <h3 className="text-xl font-bold mb-2">No characters yet</h3>
                <p className="text-gray-400 mb-6">Create your first AI character to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-medium transition"
                >
                  <Plus size={20} />
                  Create Your First Character
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCharacters.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => router.push(`/chat/${character.id}`)}
                    className="bg-[#252836] border border-white/10 rounded-xl p-5 hover:border-purple-500/50 cursor-pointer transition group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(character.name)} flex items-center justify-center text-2xl font-bold`}>
                          {character.avatar_url ? (
                            <img src={character.avatar_url} alt={character.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            character.name[0]
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#252836]"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">{character.name}</h3>
                        <span className="text-xs text-gray-500">
                          {character.created_at ? new Date(character.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{character.personality}</p>
                    <div className="flex items-center justify-between">
                      <button
                        className="text-sm text-purple-400 hover:text-purple-300 transition"
                      >
                        Start Chat →
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${character.name}?`)) {
                            handleDelete(character.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Character Modal */}
      {showCreateModal && (
        <CreateCharacterModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(character) => {
            loadCharacters();
            router.push(`/chat/${character.id}`);
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#7c3aed] border-t border-white/10 safe-area-inset-bottom z-50">
        <div className="flex items-center justify-around px-2 py-3">
          <button 
            onClick={() => setShowStats(false)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${!showStats ? 'bg-white/20' : 'hover:bg-white/10'} transition`}
          >
            <Home size={20} />
            <span className="text-xs">Home</span>
          </button>
          
          <button 
            onClick={() => setShowStats(true)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${showStats ? 'bg-white/20' : 'hover:bg-white/10'} transition`}
          >
            <BarChart3 size={20} />
            <span className="text-xs">Stats</span>
          </button>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <Plus size={20} />
            <span className="text-xs">Create</span>
          </button>

          <div className="flex flex-col items-center gap-1">
            <ThemeToggle />
            <span className="text-xs">Theme</span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <LogOut size={20} />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
