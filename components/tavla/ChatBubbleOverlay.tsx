'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '@/lib/tavla/chatPhrases';

interface ChatBubbleOverlayProps {
  message: ChatMessage | null;
  position: 'top' | 'bottom'; // 'top' for opponent, 'bottom' for player
}

export const ChatBubbleOverlay: React.FC<ChatBubbleOverlayProps> = ({
  message,
  position,
}) => {
  if (!message) return null;

  const isTop = position === 'top';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: isTop ? -8 : 8, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, y: isTop ? -6 : 6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`absolute ${
          isTop ? 'top-14 left-1/2 -translate-x-1/2' : 'bottom-16 left-1/2 -translate-x-1/2'
        } z-40 max-w-[240px] sm:max-w-[280px] pointer-events-none`}
      >
        <div className="relative px-3.5 py-2 rounded-2xl bg-gradient-to-br from-[#2a170e]/95 via-[#1c0f08]/95 to-[#120904]/95 border-2 border-amber-400/80 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.35)] backdrop-blur-xl text-center">
          {/* Top gloss */}
          <span className="absolute inset-x-2 top-0.5 h-[35%] rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

          {/* Speech Bubble Pointer Arrow */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent ${
              isTop
                ? '-top-2 border-b-[8px] border-b-amber-400/80'
                : '-bottom-2 border-t-[8px] border-t-amber-400/80'
            }`}
          />

          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="text-xs">{message.categoryIcon || '💬'}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {message.senderName}
            </span>
          </div>

          <p className="font-serif-tavla font-bold text-xs sm:text-sm text-[#fef3c7] leading-snug drop-shadow-sm">
            &ldquo;{message.phrase}&rdquo;
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
