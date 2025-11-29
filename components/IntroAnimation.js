'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Sparkles } from 'lucide-react';

export default function IntroAnimation({ onComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),      // Logo appear
      setTimeout(() => setStage(2), 1500),     // Tagline appear
      setTimeout(() => setStage(3), 2500),     // Features appear
      setTimeout(() => onComplete(), 3800),    // Fade out and complete
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0f1117] via-[#1a1d29] to-[#0f1117]"
        >
          <div className="text-center px-6">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={stage >= 1 ? { scale: 1, rotate: 0 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mb-6"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(124, 58, 237, 0.3)",
                      "0 0 40px rgba(124, 58, 237, 0.6)",
                      "0 0 20px rgba(124, 58, 237, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <MessageSquare size={48} className="text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            >
              Airer
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={stage >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-xl text-gray-300 mb-8"
            >
              A Friends Platform
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={stage >= 3 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-8 text-gray-400"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={stage >= 3 ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <Users size={20} className="text-purple-400" />
                <span className="text-sm">Create</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={stage >= 3 ? { scale: 1 } : {}}
                transition={{ delay: 0.2 }}
                className="w-1 h-1 rounded-full bg-purple-400"
              />

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={stage >= 3 ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2"
              >
                <MessageSquare size={20} className="text-pink-400" />
                <span className="text-sm">Chat</span>
              </motion.div>
            </motion.div>

            {/* Loading Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={stage >= 1 ? { opacity: 1 } : {}}
              className="flex items-center justify-center gap-2 mt-12"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-purple-500"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
