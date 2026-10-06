'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DiceCallout } from '@/lib/tavla/types';

interface TavlaDice3DProps {
  dice: [number, number] | null;
  callout: DiceCallout | null;
  isRolling: boolean;
  remainingMoves?: number[];
  canReroll?: boolean;
  onReroll?: () => void;
  onRollClick?: () => void;
  isPlayerTurn: boolean;
  hasDice: boolean;
}

// 3D rotation Euler angles for target faces 1..6
const FACE_ROTATIONS: Record<number, { rotateX: number; rotateY: number }> = {
  1: { rotateX: 0, rotateY: 0 },
  2: { rotateX: -90, rotateY: 0 },
  3: { rotateX: 0, rotateY: 90 },
  4: { rotateX: 0, rotateY: -90 },
  5: { rotateX: 90, rotateY: 0 },
  6: { rotateX: 180, rotateY: 0 },
};

// Render pip dots on 3D die face with authentic Turkish bone/ebony & ruby styling
function DieFace({ value }: { value: number }) {
  const pipClassRed =
    'relative w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_2px_rgba(255,255,255,0.4)] ring-1 ring-red-900/60 after:absolute after:top-0.5 after:left-0.5 after:w-1 after:h-1 after:bg-white/60 after:rounded-full';
  
  const pipClassBlack =
    'relative w-3 h-3 rounded-full bg-gradient-to-br from-stone-800 via-stone-900 to-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.7),0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-black/70 after:absolute after:top-0.5 after:left-0.5 after:w-0.5 after:h-0.5 after:bg-white/50 after:rounded-full';

  const pipClassBlackSmall =
    'relative w-2.5 h-2.5 rounded-full bg-gradient-to-br from-stone-800 via-stone-900 to-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.7),0_1px_1px_rgba(255,255,255,0.35)] ring-1 ring-black/70 after:absolute after:top-0.5 after:left-0.5 after:w-0.5 after:h-0.5 after:bg-white/50 after:rounded-full';

  const renderPips = () => {
    switch (value) {
      case 1:
        // Yek: Center ruby red
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="relative w-4.5 h-4.5 rounded-full bg-gradient-to-br from-red-500 via-red-700 to-red-950 shadow-[inset_0_2px_3px_rgba(0,0,0,0.6),0_1px_3px_rgba(255,255,255,0.5)] ring-2 ring-red-900/40 after:absolute after:top-1 after:left-1 after:w-1.5 after:h-1.5 after:bg-white/70 after:rounded-full" />
          </div>
        );
      case 2:
        // Dü: Two diagonal ebony pips
        return (
          <div className="w-full h-full flex justify-between p-2.5">
            <span className={pipClassBlack} />
            <span className={`${pipClassBlack} self-end`} />
          </div>
        );
      case 3:
        // Se: Three diagonal ebony pips
        return (
          <div className="w-full h-full flex justify-between p-2.5">
            <span className={pipClassBlack} />
            <span className={`${pipClassBlack} self-center`} />
            <span className={`${pipClassBlack} self-end`} />
          </div>
        );
      case 4:
        // Cihar: 4 corner ruby red pips (Turkish coffeehouse tradition)
        return (
          <div className="w-full h-full grid grid-cols-2 p-2 place-items-center">
            <span className={pipClassRed} />
            <span className={pipClassRed} />
            <span className={pipClassRed} />
            <span className={pipClassRed} />
          </div>
        );
      case 5:
        // Penc: 4 corner ebony pips + 1 center ruby red pip
        return (
          <div className="w-full h-full relative p-2.5">
            <span className={`absolute top-2 left-2 ${pipClassBlack}`} />
            <span className={`absolute top-2 right-2 ${pipClassBlack}`} />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 relative w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] ring-1 ring-red-900/60 after:absolute after:top-0.5 after:left-0.5 after:w-1 after:h-1 after:bg-white/60 after:rounded-full" />
            <span className={`absolute bottom-2 left-2 ${pipClassBlack}`} />
            <span className={`absolute bottom-2 right-2 ${pipClassBlack}`} />
          </div>
        );
      case 6:
        // Şeş: 6 ebony pips (2 columns of 3)
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 place-items-center gap-y-1">
            <span className={pipClassBlackSmall} />
            <span className={pipClassBlackSmall} />
            <span className={pipClassBlackSmall} />
            <span className={pipClassBlackSmall} />
            <span className={pipClassBlackSmall} />
            <span className={pipClassBlackSmall} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#fffefc] via-[#f7ecd5] to-[#ebd4b0] border border-[#b8956b]/80 rounded-[10px] shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(110,65,25,0.2),0_2px_6px_rgba(0,0,0,0.3)]">
      {renderPips()}
    </div>
  );
}

// Single 3D Die Cube Component with Physics Spinning & Landing Bounce
function SingleCube({
  value,
  isRolling,
  dieIndex,
  offsetAngle = 0,
}: {
  value: number;
  isRolling: boolean;
  dieIndex: 1 | 2;
  offsetAngle?: number;
}) {
  const size = 52; // px cube size
  const half = size / 2;

  const targetFace = FACE_ROTATIONS[value] || FACE_ROTATIONS[6];

  // Distinct trajectory patterns for die 1 vs die 2 so they look naturally thrown
  const isDie1 = dieIndex === 1;

  // Multi-axis 3D tumble keyframes while in the air (isRolling)
  const rollRotationX = isDie1
    ? [0, 720 + offsetAngle, 1440, 2160 + offsetAngle]
    : [0, -540 - offsetAngle, -1260, -1980 - offsetAngle];

  const rollRotationY = isDie1
    ? [0, 1080 - offsetAngle, 1800, 2520]
    : [0, 900 + offsetAngle, 1620, 2340 + offsetAngle];

  const rollRotationZ = isDie1
    ? [0, 360, 720, 1080]
    : [0, -360, -720, -1080];

  // Physical vertical lift & flight arc during throw
  const rollY = isDie1
    ? [0, -62, -28, -55, -20, 0]
    : [0, -70, -32, -60, -18, 0];

  const rollX = isDie1
    ? [0, -12, 6, -10, 2, 0]
    : [0, 14, -8, 12, -4, 0];

  // Decaying bounce keyframes when dice hit the surface:
  // Drop from air -> Hard impact at 0 -> Bounce 1 to -16px -> Impact at 0 -> Micro-bounce to -5px -> Final settle at 0
  const bounceY = isDie1
    ? [-42, 0, -15, 0, -4, 0]
    : [-46, 0, -18, 0, -5, 0];

  // Impact squash-and-stretch: compresses vertically on impact (scaleY 0.88), widens horizontally (scaleX 1.06)
  const bounceScaleY = [1, 0.88, 1.06, 0.96, 1.02, 1];
  const bounceScaleX = [1, 1.07, 0.96, 1.02, 0.99, 1];

  // Floor shadow dynamics matching height and impact
  const shadowScale = isRolling
    ? [1, 0.45, 0.7, 0.42, 0.75, 1]
    : [0.5, 1.35, 0.75, 1.15, 0.92, 1];

  const shadowOpacity = isRolling
    ? [0.6, 0.2, 0.45, 0.18, 0.5, 0.6]
    : [0.2, 0.85, 0.45, 0.75, 0.58, 0.65];

  // Subtle angular wobble as die settles on felt
  const settleTiltZ = isDie1 ? 4 : -4;

  return (
    <div className="relative perspective-dice w-[52px] h-[52px]">
      {/* OUTER PHYSICS CONTAINER: Handles Flight Arc, Landing Bounce & Squash-and-Stretch */}
      <motion.div
        className="w-full h-full relative"
        animate={
          isRolling
            ? {
                y: rollY,
                x: rollX,
                scaleY: [1, 1.08, 0.95, 1.06, 1],
                scaleX: [1, 0.95, 1.05, 0.97, 1],
              }
            : {
                y: bounceY,
                x: 0,
                scaleY: bounceScaleY,
                scaleX: bounceScaleX,
              }
        }
        transition={
          isRolling
            ? {
                type: 'tween',
                duration: 0.75,
                ease: 'easeInOut',
                repeat: Infinity,
              }
            : {
                type: 'tween',
                duration: 0.65,
                times: [0, 0.28, 0.52, 0.72, 0.88, 1],
                ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn'],
              }
        }
      >
        {/* INNER 3D CUBE CONTAINER: Handles High-Speed 3D Rotations & Settling to Target Face */}
        <motion.div
          key={`${dieIndex}-${isRolling ? 'rolling' : value}`}
          className="w-full h-full preserve-3d relative cursor-pointer"
          animate={
            isRolling
              ? {
                  rotateX: rollRotationX,
                  rotateY: rollRotationY,
                  rotateZ: rollRotationZ,
                }
              : {
                  rotateX: [
                    targetFace.rotateX + (isDie1 ? 360 : -360),
                    targetFace.rotateX,
                  ],
                  rotateY: [
                    targetFace.rotateY + (isDie1 ? 360 : -360),
                    targetFace.rotateY,
                  ],
                  rotateZ: [settleTiltZ * 2, 0],
                }
          }
          transition={
            isRolling
              ? {
                  type: 'tween',
                  duration: 0.75,
                  ease: 'linear',
                  repeat: Infinity,
                }
              : {
                  type: 'tween',
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
        >
          {/* Face 1 (Front: Z +half) */}
          <div
            className="absolute inset-0 preserve-3d"
            style={{ transform: `translateZ(${half}px)` }}
          >
            <DieFace value={1} />
          </div>

          {/* Face 2 (Top: rotateX 90, translateZ half) */}
          <div
            className="absolute inset-0 preserve-3d"
            style={{ transform: `rotateX(90deg) translateZ(${half}px)` }}
          >
            <DieFace value={2} />
          </div>

          {/* Face 3 (Left: rotateY -90, translateZ half) */}
          <div
            className="absolute inset-0 preserve-3d"
            style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }}
          >
            <DieFace value={3} />
          </div>

          {/* Face 4 (Right: rotateY 90, translateZ half) */}
          <div
            className="absolute inset-0 preserve-3d"
            style={{ transform: `rotateY(90deg) translateZ(${half}px)` }}
          >
            <DieFace value={4} />
          </div>

          {/* Face 5 (Bottom: rotateX -90, translateZ half) */}
          <div
            className="absolute inset-0 preserve-3d"
            style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }}
          >
            <DieFace value={5} />
          </div>

          {/* Face 6 (Back: rotateX 180, translateZ half) */}
          <div
            className="absolute inset-0 preserve-3d"
            style={{ transform: `rotateX(180deg) translateZ(${half}px)` }}
          >
            <DieFace value={6} />
          </div>
        </motion.div>
      </motion.div>

      {/* Dynamic 3D Floor Shadow Responding to Height & Bounces */}
      <motion.div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-11 h-3.5 bg-black/60 rounded-full blur-[3px] pointer-events-none"
        animate={{
          scale: shadowScale,
          opacity: shadowOpacity,
        }}
        transition={
          isRolling
            ? {
                type: 'tween',
                duration: 0.75,
                ease: 'easeInOut',
                repeat: Infinity,
              }
            : {
                type: 'tween',
                duration: 0.65,
                times: [0, 0.28, 0.52, 0.72, 0.88, 1],
                ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn'],
              }
        }
      />
    </div>
  );
}

export const TavlaDice3D: React.FC<TavlaDice3DProps> = ({
  dice,
  callout,
  isRolling,
  remainingMoves = [],
  canReroll = false,
  onReroll,
  onRollClick,
  isPlayerTurn,
  hasDice,
}) => {
  const d1 = dice ? dice[0] : 6;
  const d2 = dice ? dice[1] : 6;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* 3D Dice Display Tray (Otantik Deri Zar Tepsisi) */}
      <div className="relative flex items-center justify-center gap-9 py-4 px-7 rounded-3xl bg-gradient-to-b from-[#211209]/95 via-[#180c05]/95 to-[#120703]/95 border-2 border-[#d97706]/40 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.15)] backdrop-blur-xl">
        {/* Brass corner brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/50 pointer-events-none" />

        <SingleCube value={d1} isRolling={isRolling} dieIndex={1} offsetAngle={35} />
        <SingleCube value={d2} isRolling={isRolling} dieIndex={2} offsetAngle={-45} />

        {/* Rolling Status Indicator Overlay */}
        {isRolling && (
          <div className="absolute -top-3.5 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full bg-amber-500 text-stone-950 font-serif-tavla text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse border border-amber-300 flex items-center gap-1.5">
            <span className="animate-spin text-xs">🎲</span>
            <span>Zarlar Çalkalanıyor...</span>
          </div>
        )}

        {/* Remaining Move Counters (Doubles have 4 moves) */}
        {hasDice && !isRolling && remainingMoves.length > 0 && (
          <div className="absolute -top-3.5 right-3 flex items-center gap-1.5 bg-[#170e08] border border-[#d97706]/50 px-2.5 py-0.5 rounded-full shadow-lg">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#f59e0b]">
              Kalan:
            </span>
            <div className="flex items-center gap-1">
              {remainingMoves.map((m, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 rounded-full bg-[#d97706] text-[#120b07] text-[10px] font-bold flex items-center justify-center shadow"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Traditional Turkish Tavla Nidası (Callout Badge with Ottoman Rhyme) */}
      {callout && !isRolling && hasDice && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          className="flex flex-col items-center text-center px-4 py-1.5 rounded-2xl bg-gradient-to-r from-[#29170e]/95 via-[#341b10]/95 to-[#29170e]/95 border border-[#d97706]/40 shadow-xl backdrop-blur-md"
        >
          <span className="font-serif-tavla text-base sm:text-lg font-black tracking-wider text-[#fbbf24] drop-shadow-sm">
            {callout.name}
          </span>
          {callout.rhyme && (
            <span className="text-xs italic text-[#e6cca5]/90 tracking-wide font-medium mt-0.5">
              &ldquo;{callout.rhyme}&rdquo;
            </span>
          )}
        </motion.div>
      )}

      {/* Action Controls: Roll Dice or Re-Roll with AdMob Reward */}
      {isPlayerTurn && !hasDice && !isRolling && (
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRollClick}
          className="relative group px-7 py-3 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-[#120b07] font-serif-tavla font-black text-sm sm:text-base tracking-wider shadow-[0_8px_25px_rgba(245,158,11,0.45)] transition-all flex items-center gap-2.5 border-2 border-[#fef3c7]/40"
        >
          <span className="absolute inset-x-4 top-1 h-[30%] rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
          <span className="text-lg">🎲</span>
          <span>ZAR AT</span>
        </motion.button>
      )}

      {/* In-game Re-roll Action (if player has rewarded re-roll credit) */}
      {isPlayerTurn && hasDice && !isRolling && canReroll && onReroll && (
        <button
          onClick={onReroll}
          className="text-xs px-3.5 py-1.5 rounded-xl bg-[#3b2111]/90 hover:bg-[#4d2a15] text-[#fbbf24] border border-[#d97706]/50 transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
          title="Kazanılan zar yenileme hakkını kullan"
        >
          <span>🔄</span>
          <span>Zarı Yeniden At (1 Hak)</span>
        </button>
      )}
    </div>
  );
};
