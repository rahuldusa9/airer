'use client';

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-pink/15 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-neon-green/15 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  );
}
