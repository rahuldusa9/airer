'use client';

export default function AvatarSphere({ character }) {
  const colors = {
    'neon-blue': '#00f3ff',
    'neon-purple': '#bf00ff',
    'neon-pink': '#ff006e',
    'neon-green': '#39ff14',
  };

  const colorKeys = Object.keys(colors);
  const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-black/30">
      {/* Main avatar circle */}
      <div 
        className="w-32 h-32 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, ${randomColor}40, ${randomColor}10)`,
          boxShadow: `0 0 60px ${randomColor}80, inset 0 0 30px ${randomColor}40`,
          animation: 'pulse 3s ease-in-out infinite, spin 8s linear infinite'
        }}
      />
      
      {/* Orbiting particles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: randomColor,
              boxShadow: `0 0 10px ${randomColor}`,
              animation: `orbit ${5 + i}s linear infinite`,
              animationDelay: `${i * 0.5}s`,
              transform: `rotate(${i * 45}deg) translateX(80px)`
            }}
          />
        ))}
      </div>

      {/* Character name */}
      {character?.name && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-lg font-bold glow-text" style={{ color: randomColor }}>
            {character.name}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(80px); }
          to { transform: rotate(360deg) translateX(80px); }
        }
      `}</style>
    </div>
  );
}
