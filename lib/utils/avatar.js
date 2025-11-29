// Generate consistent avatar gradient colors based on name
export function getAvatarGradient(name) {
  if (!name) return 'from-purple-500 to-pink-500';
  
  const gradients = [
    'from-blue-600 to-cyan-500',
    'from-green-600 to-emerald-500',
    'from-orange-600 to-red-500',
    'from-pink-600 to-rose-500',
    'from-purple-600 to-indigo-500',
    'from-yellow-600 to-amber-500',
    'from-teal-600 to-cyan-500',
    'from-indigo-600 to-blue-500',
    'from-red-600 to-orange-500',
    'from-cyan-600 to-teal-500',
    'from-emerald-600 to-green-500',
    'from-rose-600 to-red-500',
    'from-amber-600 to-orange-500',
    'from-violet-600 to-fuchsia-500',
    'from-lime-600 to-emerald-500',
    'from-fuchsia-600 to-purple-500',
    'from-sky-600 to-blue-500',
    'from-slate-600 to-gray-500',
  ];
  
  // Improved hash function with better distribution
  let hash = 0;
  const str = String(name).toLowerCase();
  
  // Use multiple passes for better randomization
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Additional mixing
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = (hash >> 16) ^ hash;
  
  // Use absolute value and ensure positive index
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
