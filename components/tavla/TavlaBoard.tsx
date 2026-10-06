'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BoardState,
  DiceCallout,
  Move,
  PlayerColor,
  TurnSnapshot,
  Opponent,
  GameMode,
} from '@/lib/tavla/types';
import {
  createInitialBoard,
  cloneBoard,
  getLegalMovesForDie,
  applyMove,
  checkGameEnd,
  selectBestAiMove,
  canPlayerBearOff,
  filterForcedDice,
} from '@/lib/tavla/engine';
import { getDiceCallout } from '@/lib/tavla/diceCallouts';
import { soundEffects } from '@/lib/audio/soundEffects';
import { cloudflareStorage, UserProfile } from '@/lib/cloudflare/storage';
import { AdMobBanner } from './AdMobBanner';
import { BOARD_SKINS } from '@/lib/tavla/customizationData';
import { useTavlaChat } from '@/hooks/useTavlaChat';
import { ChatBubbleOverlay } from './ChatBubbleOverlay';
import { CoffeehouseChatDrawer } from './CoffeehouseChatDrawer';
import { TavlaDice3D } from './TavlaDice3D';
import { CheckerPiece } from './CheckerPiece';
import { PlayerAvatar } from './PlayerAvatar';
import { InGameActionDock, ChatVisibilityMode } from './InGameActionDock';
import { SafeImage } from './SafeImage';
import { evaluateMoveAdvice, MoveAdvice } from '@/lib/tavla/moveAdvisor';
import { LeaderboardPlayer } from '@/app/api/leaderboard/route';

interface TavlaBoardProps {
  opponent: Opponent;
  gameMode: GameMode;
  userProfile: UserProfile;
  onGameOver: (result: { won: boolean; isMars: boolean; score: number }) => void;
  onBackToLobby: () => void;
  onOpenStats: () => void;
  onOpenLeaderboard?: () => void;
  onOpenProfile?: () => void;
  onInspectPlayer?: (player: Opponent | LeaderboardPlayer) => void;
  onOpenAudioSettings?: () => void;
  onOpenCustomization?: () => void;
  onOpenBoardStore?: () => void;
}

interface ValidTarget {
  to: number | 'off';
  die: number;
  isHit?: boolean;
  combinedDice?: [number, number];
  intermediatePoint?: number;
}

export const TavlaBoard: React.FC<TavlaBoardProps> = ({
  opponent,
  gameMode,
  userProfile,
  onGameOver,
  onBackToLobby,
  onOpenStats,
  onOpenLeaderboard,
  onOpenProfile,
  onInspectPlayer,
  onOpenAudioSettings,
  onOpenCustomization,
  onOpenBoardStore,
}) => {
  // Not: tahta boyutları saf CSS kırılımlarıyla yönetilir (globals.css `xs` dahil).
  // JS ile pencere takibi ve ölü checkerSize/pointHeightClass kaldırıldı.

  // Active board skin from custom collection
  const activeSkin =
    BOARD_SKINS.find(s => s.id === userProfile.boardSkinId) || BOARD_SKINS[0];

  // Game State
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [turn, setTurn] = useState<PlayerColor>('white'); // 'white' = player (Sedef), 'black' = opponent (Abanoz)
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [remainingMoves, setRemainingMoves] = useState<number[]>([]);
  const [callout, setCallout] = useState<DiceCallout | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [selectedPoint, setSelectedPoint] = useState<number | 'bar' | null>(null);
  const [validTargets, setValidTargets] = useState<ValidTarget[]>([]);
  const [turnSnapshots, setTurnSnapshots] = useState<TurnSnapshot[]>([]);
  const [aiStatusText, setAiStatusText] = useState<string>('');
  const [lastActionToast, setLastActionToast] = useState<string>('');
  const [reRollUsedInMatch, setReRollUsedInMatch] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getIsMuted());
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  // Limited Undo Mechanics: 2 undos allowed per game, with a 5-second cooldown
  const [undosRemaining, setUndosRemaining] = useState<number>(2);
  const [undoCooldownSeconds, setUndoCooldownSeconds] = useState<number>(0);

  // Blitz Mode (15-Second Turn Limit & Boosted Coin Rewards)
  const isBlitz = gameMode === 'blitz';
  const [blitzTimer, setBlitzTimer] = useState<number>(15);

  // Usta Hamle Danışmanı (Move Advisor)
  const [isAdvisorEnabled, setIsAdvisorEnabled] = useState<boolean>(true);
  const [masterStreak, setMasterStreak] = useState<number>(0);

  const adviceResult = useMemo(() => {
    if (turn !== 'white' || remainingMoves.length === 0 || gameEnded) {
      return {
        hasMove: false,
        bestAdvice: null,
        alternativeAdvices: [],
        totalPossibleMoves: 0,
        highlightPoints: null,
      };
    }
    // Danışman da büyük-zar-zorunluluğuna uyar (yanlış zarı önermez)
    return evaluateMoveAdvice(board, 'white', filterForcedDice(board, 'white', remainingMoves), isBlitz);
  }, [board, remainingMoves, turn, isBlitz, gameEnded]);

  // Real-Time Turkish Coffeehouse Chat
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState<boolean>(false);
  const [chatVisibilityMode, setChatVisibilityMode] = useState<ChatVisibilityMode>('expanded');
  const [matchId] = useState<string>(() => `match_${opponent.id}_room`);

  const {
    messages: chatMessages,
    isConnected: isChatConnected,
    activePlayerBubble,
    activeOpponentBubble,
    cooldownSeconds: chatCooldown,
    sendPhrase: handleSendPhrase,
  } = useTavlaChat({
    matchId,
    playerName: userProfile.name,
    playerAvatar: userProfile.avatar || '/images/avatar_genc_cirak.jpg',
    opponentId: opponent.id,
    opponentName: opponent.name,
    opponentAvatar: opponent.avatar,
    isAiMatch: gameMode === 'ai' || gameMode === 'blitz',
  });

  // Roll history for statistics
  const currentMatchRolls = useRef<string[]>([]);

  // Show quick notification toast
  const triggerToast = (msg: string) => {
    setLastActionToast(msg);
    setTimeout(() => {
      setLastActionToast(prev => (prev === msg ? '' : prev));
    }, 2800);
  };

  // Check Game End after each state change
  const evaluateGameEnd = (currentBoard: BoardState) => {
    const end = checkGameEnd(currentBoard);
    if (end.isOver && !gameEnded) {
      setGameEnded(true);
      const won = end.winner === 'white';
      soundEffects.playVictory(end.isMars);

      // Boosted Coin Rewards in Blitz Mode (600 for win, 1000 for Mars, 120 for loss)
      const baseCoin = won ? (end.isMars ? 500 : 250) : 50;
      const coinReward = isBlitz ? (won ? (end.isMars ? 1000 : 600) : 120) : baseCoin;

      cloudflareStorage.recordMatchResult(
        won,
        end.isMars,
        opponent.name,
        coinReward,
        currentMatchRolls.current
      );
      setTimeout(() => {
        onGameOver({ won, isMars: end.isMars, score: end.score });
      }, 1200);
    }
  };

  // Roll Dice for Current Player (force: zar yenileme sonrası eski closure guard'ını atlatır)
  const rollDice = (force: boolean = false) => {
    if (!force && (isRolling || dice !== null || gameEnded)) return;

    setIsRolling(true);
    soundEffects.playDiceShake();

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      soundEffects.playDiceRoll();
      setIsRolling(false);
      setDice([d1, d2]);

      const moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
      setRemainingMoves(moves);

      // Record callout
      const call = getDiceCallout(d1, d2);
      setCallout(call);
      currentMatchRolls.current.push(`${Math.max(d1, d2)}-${Math.min(d1, d2)}`);

      // Initialize turn snapshots for undo
      setTurnSnapshots([{ board: cloneBoard(board), remainingMoves: [...moves], executedMoves: [] }]);

      // Check if any legal moves exist
      checkLegalMovesAvailable(board, turn, moves);
    }, 820);
  };

  // Re-roll using AdMob Rewarded Action
  // Not: setTimeout içinde eski closure'daki rollDice çağrılmaz; ref üzerinden
  // güncel state ile force-roll yapılır (yoksa zar takılı kalırdı).
  const handleReroll = () => {
    if (reRollUsedInMatch || userProfile.reRollCredits <= 0 || turn !== 'white' || !dice) return;
    setReRollUsedInMatch(true);
    const updated = {
      ...userProfile,
      reRollCredits: Math.max(0, userProfile.reRollCredits - 1),
    };
    cloudflareStorage.saveProfile(updated);
    triggerToast('🎲 Zar yenilendi!');
    setDice(null);
    setRemainingMoves([]);
    setCallout(null);
    setSelectedPoint(null);
    setValidTargets([]);
    setTimeout(() => {
      rollDiceRef.current(true);
    }, 200);
  };

  // Check if player has moves, if not pass turn
  const checkLegalMovesAvailable = (
    currentBoard: BoardState,
    player: PlayerColor,
    moves: number[]
  ) => {
    if (moves.length === 0) {
      endTurn(currentBoard);
      return;
    }

    const uniqueDice = Array.from(new Set(moves));
    let hasAnyLegal = false;

    for (const d of uniqueDice) {
      const legal = getLegalMovesForDie(currentBoard, player, d);
      if (legal.length > 0) {
        hasAnyLegal = true;
        break;
      }
    }

    if (!hasAnyLegal) {
      triggerToast(`${player === 'white' ? 'Geçerli hamle yok' : opponent.name + ' hamle yapamıyor'}, sıra geçti!`);
      setTimeout(() => {
        endTurn(currentBoard);
      }, 1500);
    }
  };

  // End turn & swap player
  const endTurn = (finalBoard: BoardState) => {
    setDice(null);
    setRemainingMoves([]);
    setCallout(null);
    setSelectedPoint(null);
    setValidTargets([]);
    setTurnSnapshots([]);
    if (isBlitz) {
      setBlitzTimer(15);
    }
    const nextTurn = turn === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    evaluateGameEnd(finalBoard);
  };

  const endTurnRef = useRef(endTurn);
  const evaluateGameEndRef = useRef(evaluateGameEnd);
  const rollDiceRef = useRef(rollDice);
  const boardRef = useRef(board);

  useEffect(() => {
    endTurnRef.current = endTurn;
    evaluateGameEndRef.current = evaluateGameEnd;
    rollDiceRef.current = rollDice;
    boardRef.current = board;
  });

  // Blitz 15-Second Turn Countdown Timer
  useEffect(() => {
    if (!isBlitz || gameEnded) return;

    const interval = setInterval(() => {
      setBlitzTimer(prev => {
        if (prev <= 1) {
          if (turn === 'white') {
            soundEffects.playCheckerHit();
            setTimeout(() => {
              setLastActionToast('⚡ 15 saniyelik hamle süreniz doldu! Sıra rakibe devredildi.');
              endTurnRef.current(boardRef.current);
            }, 0);
          }
          return 0;
        }
        if (prev <= 6 && turn === 'white') {
          soundEffects.playCheckerDrop();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlitz, turn, gameEnded]);

  // Undo countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (undoCooldownSeconds > 0) {
      timer = setTimeout(() => {
        setUndoCooldownSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [undoCooldownSeconds]);

  // Undo Move ("Hamleyi Geri Al") - limited to 2 per game with cooldown
  const handleUndo = () => {
    if (undosRemaining <= 0) {
      triggerToast('Bu maçta geri alma hakkınız tükendi! (Maks 2)');
      return;
    }
    if (undoCooldownSeconds > 0) {
      triggerToast(`Geri alma için bekleyin: ${undoCooldownSeconds} sn`);
      return;
    }
    if (turnSnapshots.length <= 1) {
      triggerToast('Geri alınacak hamle yok');
      return;
    }

    soundEffects.playUndo();
    const newSnapshots = [...turnSnapshots];
    newSnapshots.pop(); // Remove current state
    const previous = newSnapshots[newSnapshots.length - 1];

    setBoard(cloneBoard(previous.board));
    setRemainingMoves([...previous.remainingMoves]);
    setTurnSnapshots(newSnapshots);
    setSelectedPoint(null);
    setValidTargets([]);

    const newRemaining = undosRemaining - 1;
    setUndosRemaining(newRemaining);
    setUndoCooldownSeconds(5); // 5 seconds tactical cooldown

    triggerToast(`↩ Hamle geri alındı! Kalan hak: ${newRemaining}`);
  };

  // Execute Recommended Master Move (Usta Tavsiyesini Uygula)
  const handleApplyAdvisedMove = (adviceToApply: MoveAdvice) => {
    if (turn !== 'white' || remainingMoves.length === 0 || gameEnded) return;

    const move = adviceToApply.move;

    if (move.isHit) {
      soundEffects.playCheckerHit();
      triggerToast('💥 Usta Vurgunu! Rakip pul kırıldı!');
    } else if (move.to === 'off') {
      soundEffects.playCheckerDrop();
      triggerToast('🎯 Usta Toplaması! Pul tahtadan alındı!');
    } else {
      soundEffects.playCheckerSlide();
      triggerToast(`✨ Usta Hamlesi: ${adviceToApply.title}`);
    }

    if (isBlitz) {
      setBlitzTimer(prev => Math.min(15, prev + 3));
      triggerToast('⚡ +3s Blitz Ekstra Süre Bonusu!');
    }

    setMasterStreak(prev => {
      const next = prev + 1;
      if (next >= 3) {
        soundEffects.playCoinReward();
        triggerToast('👑 3 Usta Hamlesi Tamamlandı! +50 Akçe Bonusu!');
        cloudflareStorage.addBonusCoins(50, 15);
        return 0;
      }
      return next;
    });

    const nextBoard = applyMove(board, turn, move);
    setBoard(nextBoard);

    const nextMoves = [...remainingMoves];
    const dieIdx = nextMoves.indexOf(move.dieValue);
    if (dieIdx !== -1) nextMoves.splice(dieIdx, 1);
    setRemainingMoves(nextMoves);

    setTurnSnapshots(prev => [
      ...prev,
      {
        board: cloneBoard(nextBoard),
        remainingMoves: [...nextMoves],
        executedMoves: [move],
      },
    ]);

    setSelectedPoint(null);
    setValidTargets([]);

    const end = checkGameEnd(nextBoard);
    if (end.isOver) {
      evaluateGameEnd(nextBoard);
      return;
    }

    if (nextMoves.length === 0) {
      setTimeout(() => {
        endTurn(nextBoard);
      }, 500);
    } else {
      checkLegalMovesAvailable(nextBoard, turn, nextMoves);
    }
  };

  // Handle Point or Bar Click for Moving
  const handleSourceSelect = (from: number | 'bar') => {
    const isHumanTurn =
      turn === 'white' || gameMode === 'local_2p';
    if (!isHumanTurn) return;
    if (dice === null || remainingMoves.length === 0) return;

    // Check if player is on bar and MUST move from bar first
    const barCount = turn === 'white' ? board.bar.white : board.bar.black;
    if (barCount > 0 && from !== 'bar') {
      triggerToast('Önce kırık pulu oyuna sokmalısınız!');
      return;
    }

    if (from === selectedPoint) {
      setSelectedPoint(null);
      setValidTargets([]);
      return;
    }

    // Check valid targets for this checker with current remaining moves
    // Gerçek kural: tek zar oynanabiliyorsa büyük zar zorunludur.
    const playableDice = filterForcedDice(board, turn, remainingMoves);
    const uniqueDice = Array.from(new Set(playableDice));
    const targets: { to: number | 'off'; die: number; isHit?: boolean }[] = [];

    for (const die of uniqueDice) {
      const legalMoves = getLegalMovesForDie(board, turn, die);
      const matches = legalMoves.filter(m => m.from === from);
      matches.forEach(m => {
        targets.push({ to: m.to, die: m.dieValue, isHit: m.isHit });
      });
    }

    if (targets.length > 0) {
      setSelectedPoint(from);
      setValidTargets(targets);
      soundEffects.playCheckerSlide();
    } else {
      triggerToast('Bu pul için oynanabilir zar yok!');
    }
  };

  // Execute Move to Target
  const handleTargetClick = (target: { to: number | 'off'; die: number; isHit?: boolean }) => {
    if (selectedPoint === null) return;

    const move: Move = {
      from: selectedPoint,
      to: target.to,
      dieValue: target.die,
      isHit: target.isHit,
    };

    if (target.isHit) {
      soundEffects.playCheckerHit();
      triggerToast('💥 Vurgun! Rakip pul kırıldı!');
    } else if (target.to === 'off') {
      soundEffects.playCheckerDrop();
      triggerToast('🎯 Pul toplandı!');
    } else {
      soundEffects.playCheckerDrop();
    }

    // Did user execute the advised master move?
    if (adviceResult.bestAdvice && selectedPoint === adviceResult.bestAdvice.move.from && target.to === adviceResult.bestAdvice.move.to) {
      if (isBlitz) {
        setBlitzTimer(prev => Math.min(15, prev + 3));
        triggerToast('⚡ +3s Blitz Ekstra Süre Bonusu!');
      }
      setMasterStreak(prev => {
        const next = prev + 1;
        if (next >= 3) {
          soundEffects.playCoinReward();
          triggerToast('👑 3 Usta Hamlesi Tamamlandı! +50 Akçe Bonusu!');
          cloudflareStorage.addBonusCoins(50, 15);
          return 0;
        }
        return next;
      });
    }

    const nextBoard = applyMove(board, turn, move);
    setBoard(nextBoard);

    // Consume die
    const nextMoves = [...remainingMoves];
    const dieIdx = nextMoves.indexOf(target.die);
    if (dieIdx !== -1) nextMoves.splice(dieIdx, 1);
    setRemainingMoves(nextMoves);

    // Record snapshot for undo
    setTurnSnapshots(prev => [
      ...prev,
      {
        board: cloneBoard(nextBoard),
        remainingMoves: [...nextMoves],
        executedMoves: [],
      },
    ]);

    setSelectedPoint(null);
    setValidTargets([]);

    // Check if turn finished or game over
    const end = checkGameEnd(nextBoard);
    if (end.isOver) {
      evaluateGameEnd(nextBoard);
      return;
    }

    checkLegalMovesAvailable(nextBoard, turn, nextMoves);
  };

  // AI Opponent Turn Loop (sadece ai/blitz modunda; local_2p'de iki taraf da insan)
  useEffect(() => {
    if (gameMode === 'local_2p') {
      setAiStatusText('');
      return;
    }
    if (turn === 'black' && (gameMode === 'ai' || gameMode === 'blitz') && !gameEnded) {
      let timeoutId: NodeJS.Timeout;

      if (dice === null && !isRolling) {
        timeoutId = setTimeout(() => {
          setAiStatusText(`${opponent.name} zarları topluyor...`);
          rollDiceRef.current();
        }, isBlitz ? 350 : 600);
      } else if (dice !== null && !isRolling && remainingMoves.length > 0) {
        timeoutId = setTimeout(() => {
          setAiStatusText(`${opponent.name} hamle düşünüyor...`);
          // Select move with AI (büyük-zar-zorunluluğuna uyar)
          const playableDice = filterForcedDice(board, 'black', remainingMoves);
          const uniqueDice = Array.from(new Set(playableDice));
          let chosenMove: Move | null = null;
          let chosenDie = uniqueDice[0];

          for (const d of uniqueDice) {
            const mv = selectBestAiMove(board, 'black', d, opponent.difficulty);
            if (mv) {
              chosenMove = mv;
              chosenDie = d;
              break;
            }
          }

          if (chosenMove) {
            if (chosenMove.isHit) {
              soundEffects.playCheckerHit();
              triggerToast(`${opponent.name} pulunuzu kırdı!`);
            } else if (chosenMove.to === 'off') {
              soundEffects.playCheckerDrop();
            } else {
              soundEffects.playCheckerDrop();
            }

            const nextBoard = applyMove(board, 'black', chosenMove);
            setBoard(nextBoard);

            const nextMoves = [...remainingMoves];
            const dIdx = nextMoves.indexOf(chosenDie);
            if (dIdx !== -1) nextMoves.splice(dIdx, 1);
            setRemainingMoves(nextMoves);

            evaluateGameEndRef.current(nextBoard);
          } else {
            // No moves possible
            triggerToast(`${opponent.name} oynayamadı, sıra size geçti!`);
            endTurnRef.current(board);
          }
        }, isBlitz ? 400 : 750);
      } else if (dice !== null && !isRolling && remainingMoves.length === 0) {
        timeoutId = setTimeout(() => {
          endTurnRef.current(board);
          setAiStatusText('');
        }, isBlitz ? 300 : 500);
      }

      return () => clearTimeout(timeoutId);
    }
  }, [turn, dice, remainingMoves, isRolling, gameMode, isBlitz, gameEnded, board, opponent]);

  // Audio mute toggle
  const toggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    triggerToast(muted ? 'Ses kapatıldı' : 'Ses açıldı');
  };

  // Ambient tea sound
  const handleTeaClink = () => {
    soundEffects.playTeaGlassChime();
    triggerToast('☕ Afiyet olsun! İnce belli çay tazelendi.');
  };

  // Helper to render points on board
  const renderPointColumn = (pointIndex: number, isTop: boolean) => {
    const pt = board.points[pointIndex];
    const isSelected = selectedPoint === pointIndex;
    const isTarget = validTargets.some(t => t.to === pointIndex);
    const targetObj = validTargets.find(t => t.to === pointIndex);
    const isOdd = pointIndex % 2 === 1;

    // Check if this point can be selected (has current player checkers)
    const canSelect =
      turn === 'white' &&
      board.bar.white === 0 &&
      pt.color === 'white' &&
      pt.count > 0 &&
      dice !== null &&
      remainingMoves.length > 0;

    // Visible checkers calculation (up to 5 displayed individual checkers)
    const visibleCount = pt.count > 0 && pt.color ? Math.min(5, pt.count) : 0;
    const extraCount = pt.count > 5 ? pt.count - 5 : 0;

    return (
      <div
        key={pointIndex}
        onClick={() => {
          if (isTarget && targetObj) {
            handleTargetClick(targetObj);
          } else if (canSelect) {
            handleSourceSelect(pointIndex);
          }
        }}
        className={`relative flex-1 min-w-0 h-[130px] xs:h-[150px] sm:h-[185px] md:h-[220px] lg:h-[245px] flex flex-col items-center ${
          isTop ? 'justify-start' : 'justify-end'
        } py-0.5 sm:py-1 cursor-pointer transition-colors group select-none`}
      >
        {/* Inlaid Triangle (Flèche) with Mother-of-pearl / Walnut Marquetry */}
        <div
          className={`absolute inset-x-0 ${isTop ? 'top-0' : 'bottom-0'} h-full pointer-events-none`}
        >
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 240"
          >
            <polygon
              points={isTop ? '0,0 100,0 50,225' : '0,240 100,240 50,15'}
              fill={isOdd ? activeSkin.theme.pointDarkColor : activeSkin.theme.pointLightColor}
              stroke={isOdd ? '#452312' : '#d4af37'}
              strokeWidth="2"
              className="drop-shadow-sm opacity-95 group-hover:opacity-100 transition-opacity"
            />
            {/* Fine marquetry border line */}
            <polygon
              points={isTop ? '8,0 92,0 50,200' : '8,240 92,240 50,40'}
              fill="none"
              stroke={isOdd ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)'}
              strokeWidth="1"
              strokeDasharray="2,3"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Traditional Point Number Indicator */}
        <span
          className={`absolute ${isTop ? 'top-0.5' : 'bottom-0.5'} z-10 text-[8px] sm:text-[10px] font-mono tabular-nums font-bold ${
            isOdd ? 'text-[#a16207]/70' : 'text-[#78350f]/80'
          }`}
        >
          {pointIndex + 1}
        </span>

        {/* Valid Target Glow Ring */}
        {isTarget && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ type: 'tween', duration: 1.2, repeat: Infinity }}
            className={`absolute ${
              isTop ? 'bottom-2' : 'top-2'
            } z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#10b981]/25 border-2 border-[#34d399] flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.8)]`}
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#34d399]" />
          </motion.div>
        )}

        {/* Advisor Recommended Source Highlight */}
        {isAdvisorEnabled && adviceResult.bestAdvice?.move.from === pointIndex && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.15, 1], y: isTop ? [0, 3, 0] : [0, -3, 0] }}
            transition={{ type: 'tween', duration: 1.4, repeat: Infinity }}
            className={`absolute ${isTop ? 'top-4' : 'bottom-4'} z-30 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 border border-amber-200 text-stone-950 font-bold text-[8px] sm:text-[9px] shadow-[0_0_15px_rgba(245,158,11,0.9)] flex items-center gap-0.5 pointer-events-none`}
          >
            <span>👑</span>
            <span className="hidden sm:inline">Usta</span>
          </motion.div>
        )}

        {/* Advisor Recommended Target Highlight */}
        {isAdvisorEnabled && adviceResult.bestAdvice?.move.to === pointIndex && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.15, 1], y: isTop ? [0, -3, 0] : [0, 3, 0] }}
            transition={{ type: 'tween', duration: 1.4, repeat: Infinity, delay: 0.2 }}
            className={`absolute ${isTop ? 'bottom-2' : 'top-2'} z-30 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 border border-cyan-200 text-white font-bold text-[8px] sm:text-[9px] shadow-[0_0_15px_rgba(6,182,212,0.9)] flex items-center gap-0.5 pointer-events-none`}
          >
            <span>🎯</span>
            <span className="hidden sm:inline">Hedef</span>
          </motion.div>
        )}

        {/* Realistic Vertical Stack of Checkers */}
        {visibleCount > 0 && pt.color && (
          <div
            className={`relative z-10 flex ${
              isTop ? 'flex-col justify-start pt-1.5 sm:pt-2' : 'flex-col-reverse justify-start pb-1.5 sm:pb-2'
            } items-center w-full`}
          >
            {Array.from({ length: visibleCount }).map((_, cIdx) => {
              const isTopmost = cIdx === visibleCount - 1;
              return (
                <div
                  key={cIdx}
                  className={cIdx > 0 ? (isTop ? '-mt-4 xs:-mt-4.5 sm:-mt-5 md:-mt-6' : '-mb-4 xs:-mb-4.5 sm:-mb-5 md:-mb-6') : ''}
                >
                  <CheckerPiece
                    color={pt.color!}
                    className="w-[20px] h-[20px] xs:w-[27px] xs:h-[27px] sm:w-[32px] sm:h-[32px] md:w-[36px] md:h-[36px]"
                    isSelected={isTopmost && isSelected}
                    isLegalTarget={isTopmost && isTarget}
                    isClickable={canSelect}
                    badgeText={isTopmost && extraCount > 0 ? `+${extraCount}` : null}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center select-none px-2 sm:px-4 py-2 overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {lastActionToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-16 z-50 px-5 py-2 rounded-xl bg-[#29170e]/95 border border-[#d97706] text-[#fef3c7] font-serif-tavla text-sm shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <span>{lastActionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BAR: Opponent HUD & Match Info & Back Button */}
      <div className="relative w-full flex items-center justify-between py-2 px-3 sm:px-5 rounded-3xl bg-white/[0.05] border border-white/[0.12] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-1.5 gap-2">
        {/* Real-time Opponent Speech Bubble */}
        <ChatBubbleOverlay message={chatVisibilityMode !== 'hidden' ? activeOpponentBubble : null} position="top" />

        <div className="flex items-center gap-2.5">
          {/* Back to Lobby Return Button */}
          <button
            onClick={onBackToLobby}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-stone-900/90 to-[#24130a]/90 hover:from-rose-950/80 hover:to-stone-900 text-amber-200 hover:text-white border border-amber-400/50 hover:border-rose-400/70 transition-all font-serif-tavla text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.5)] active:scale-95 shrink-0"
            title="Oyundan çık ve kahvehane lobisine dön"
          >
            <span className="text-sm">⬅️</span>
            <span>Lobiye Dön</span>
          </button>

          {/* Opponent Profile */}
          <div
            onClick={() => onInspectPlayer?.(opponent)}
            className="flex items-center gap-2.5 cursor-pointer group"
            title={`${opponent.name} profilini ve detaylı analizini incele`}
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-400/70 group-hover:border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] bg-[#24130a] transition-all shrink-0">
              <SafeImage
                src={opponent.avatar || '/images/avatar_haci_dayi.jpg'}
                alt={opponent.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                fallbackSrc="/images/avatar_haci_dayi.jpg"
                fallbackIcon="🧔"
                fallbackText={opponent.name}
              />
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-serif-tavla font-bold text-xs sm:text-sm text-[#fef3c7] group-hover:text-amber-200 transition-colors truncate max-w-[120px] sm:max-w-none">
                  {opponent.name}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded-full border border-amber-400/40">
                  {opponent.rating} P
                </span>
                <span className="text-[9px] text-amber-300/80 bg-white/5 px-1.5 py-0.2 rounded border border-white/10 hidden md:inline">
                  🔍 Profil
                </span>
              </div>
              <div className="text-[10px] text-amber-200/70 truncate max-w-[140px] sm:max-w-[220px]">
                {aiStatusText || opponent.catchphrase}
              </div>
            </div>
          </div>
        </div>

        {/* Blitz Mode 15s Countdown Display in Top Bar */}
        {isBlitz && (
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full font-serif-tavla font-black text-xs sm:text-sm flex items-center gap-2 border transition-all duration-300 ${
                blitzTimer <= 5
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              }`}
            >
              <span className="text-sm">⚡</span>
              <span className="hidden sm:inline">BLITZ (15sn):</span>
              <span className="font-mono tabular-nums text-sm sm:text-base font-black px-2 py-0.2 rounded bg-black/40 border border-white/20">
                {blitzTimer}s
              </span>
            </div>
          </div>
        )}

        {/* Opponent Borne Off & Turn Status */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-amber-200/60 uppercase tracking-wider font-semibold">
              Toplanan
            </span>
            <div className="flex items-center gap-1">
              <span className="font-serif-tavla font-bold text-base text-[#fbbf24]">
                {board.borneOff.black}
              </span>
              <span className="text-xs text-amber-200/40">/ 15</span>
            </div>
          </div>

          {/* Turn Indicator */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-md ${
              turn === 'black'
                ? 'bg-rose-500/20 border-rose-400/60 text-rose-200 animate-pulse'
                : 'bg-white/[0.04] border-white/10 text-amber-200/60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                turn === 'black' ? 'bg-rose-400' : 'bg-white/30'
              }`}
            />
            <span>{turn === 'black' ? 'Rakipte' : 'Bekliyor'}</span>
          </div>
        </div>
      </div>

      {/* THE MASTER HANDCRAFTED TAVLA BOARD */}
      <div className={`relative w-full rounded-2xl p-2.5 sm:p-4 bg-gradient-to-br ${activeSkin.theme.outerFrameGradient} border-4 ${activeSkin.theme.outerBorderClass} shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-500`}>
        {/* Board Outer Corner Metal Details */}
        <div className={`absolute top-1.5 left-1.5 w-6 h-6 border-t-2 border-l-2 ${activeSkin.theme.cornerColorClass} pointer-events-none`} />
        <div className={`absolute top-1.5 right-1.5 w-6 h-6 border-t-2 border-r-2 ${activeSkin.theme.cornerColorClass} pointer-events-none`} />
        <div className={`absolute bottom-1.5 left-1.5 w-6 h-6 border-b-2 border-l-2 ${activeSkin.theme.cornerColorClass} pointer-events-none`} />
        <div className={`absolute bottom-1.5 right-1.5 w-6 h-6 border-b-2 border-r-2 ${activeSkin.theme.cornerColorClass} pointer-events-none`} />

        {/* Board Layout Grid */}
        <div className={`relative flex flex-col w-full ${activeSkin.theme.feltBgClass} rounded-xl border-2 border-white/10 p-2 sm:p-4 overflow-hidden shadow-inner transition-colors duration-500`}>
          {/* TOP HALF: Points 12..17 (Left) and Points 18..23 (Right) */}
          <div className="flex w-full border-b border-white/10">
            {/* Left Top Quadrant: Points 12 to 17 */}
            <div className="flex flex-1 min-w-0 gap-0.5 sm:gap-1">
              {[12, 13, 14, 15, 16, 17].map(idx => renderPointColumn(idx, true))}
            </div>

            {/* Center Bar (Kırık Pullar - Top Half) */}
            <div className="w-8 xs:w-10 sm:w-14 shrink-0 bg-black/40 border-x-2 border-white/10 flex flex-col items-center justify-center p-1 relative shadow-inner">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-500/80 tracking-widest rotate-90 sm:rotate-0 mb-1">
                BAR
              </span>
              {/* Black checkers on bar */}
              {board.bar.black > 0 && (
                <div className="my-1">
                  <CheckerPiece
                    color="black"
                    className="w-[24px] h-[24px] xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px]"
                    stackCount={board.bar.black}
                  />
                </div>
              )}
            </div>

            {/* Right Top Quadrant: Points 18 to 23 (Black's Home Board) */}
            <div className="flex flex-1 min-w-0 gap-0.5 sm:gap-1">
              {[18, 19, 20, 21, 22, 23].map(idx => renderPointColumn(idx, true))}
            </div>

            {/* Black Bearing Off Tray (Top Right) */}
            <div className="w-7 xs:w-9 sm:w-12 shrink-0 bg-black/50 border-l-2 border-white/10 flex flex-col items-center justify-start p-1 sm:p-1.5">
              <span className="text-[7px] sm:text-[8px] font-bold text-[#a88a6d] mb-1">TOPLA</span>
              <div className="w-full flex-1 rounded border border-white/10 bg-black/40 flex flex-col items-center justify-end p-0.5 sm:p-1 space-y-1">
                {Array.from({ length: Math.min(6, board.borneOff.black) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-1.5 sm:h-2 rounded-sm bg-gradient-to-r from-[#24130a] to-[#0a0604] border border-[#522d17] shadow-sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CENTER ARENA: Rolling Table & 3D Dice Showcase */}
          <div className="w-full py-2.5 sm:py-4 flex items-center justify-center relative my-1 rounded-lg border border-white/10 bg-black/35 shadow-inner">
            {/* Center Felt Watermark */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none ${activeSkin.theme.watermarkColorClass}`}>
              <span className="font-serif-tavla text-xl sm:text-4xl font-black uppercase tracking-widest text-center px-4">
                {activeSkin.theme.centerWatermark}
              </span>
            </div>

            {/* Blitz Countdown Clock In Center Arena */}
            {isBlitz && turn === 'white' && !gameEnded && (
              <div className="absolute top-1.5 sm:top-2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-rose-400/60 shadow-lg">
                <span className="text-rose-400 text-xs animate-bounce">⚡</span>
                <span className="text-[10px] uppercase font-bold text-amber-200">Hamle Süreniz:</span>
                <span
                  className={`font-mono font-black text-xs sm:text-sm px-2 py-0.2 rounded ${
                    blitzTimer <= 5
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-amber-500/30 text-amber-300'
                  }`}
                >
                  {blitzTimer} sn
                </span>
              </div>
            )}

            {/* 3D Dice Component */}
            {/* local_2p'de siyah da insandır, zar butonu onda da görünür */}
            <TavlaDice3D
              dice={dice}
              callout={callout}
              isRolling={isRolling}
              remainingMoves={remainingMoves}
              canReroll={!reRollUsedInMatch && userProfile.reRollCredits > 0}
              onReroll={handleReroll}
              onRollClick={() => rollDice()}
              isPlayerTurn={turn === 'white' || gameMode === 'local_2p'}
              hasDice={dice !== null}
            />

            {/* Prominent Floating Undo Action in Center Arena when move is made */}
            <AnimatePresence>
              {turn === 'white' && turnSnapshots.length > 1 && !gameEnded && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.92 }}
                  className="absolute bottom-1.5 sm:bottom-2 z-30 flex items-center gap-2"
                >
                  <button
                    onClick={handleUndo}
                    disabled={undosRemaining <= 0 || undoCooldownSeconds > 0}
                    className={`relative group px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-serif-tavla text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
                      undosRemaining > 0 && undoCooldownSeconds === 0
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-[0_4px_20px_rgba(245,158,11,0.5)] border border-amber-300 hover:scale-105 active:scale-95'
                        : 'bg-white/10 text-amber-200/50 border border-white/10 cursor-not-allowed'
                    }`}
                    title="Bu turda oynadığınız son hamleyi geri alır"
                  >
                    <span className="absolute inset-x-3 top-0.5 h-[35%] rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                    <span className="text-sm sm:text-base">↩</span>
                    <span>Hamleyi Geri Al</span>
                    {undoCooldownSeconds > 0 ? (
                      <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                        {undoCooldownSeconds}s
                      </span>
                    ) : (
                      <span className="bg-stone-950/25 text-stone-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                        {undosRemaining}/2 Hak
                      </span>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM HALF: Points 11..6 (Left) and Points 5..0 (Right: White's Home Board) */}
          <div className="flex w-full border-t border-[#452312]/60">
            {/* Left Bottom Quadrant: Points 11 down to 6 */}
            <div className="flex flex-1 min-w-0 gap-0.5 sm:gap-1">
              {[11, 10, 9, 8, 7, 6].map(idx => renderPointColumn(idx, false))}
            </div>

            {/* Center Bar (Kırık Pullar - Bottom Half: White bar) */}
            <div
              onClick={() => {
                if (board.bar.white > 0 && turn === 'white') {
                  handleSourceSelect('bar');
                }
              }}
              className={`w-8 xs:w-10 sm:w-14 shrink-0 bg-[#25150c] border-x-2 border-[#542d17] flex flex-col items-center justify-center p-1 relative shadow-inner ${
                board.bar.white > 0 && turn === 'white' ? 'cursor-pointer ring-2 ring-[#fbbf24]' : ''
              }`}
            >
              {/* White checkers on bar */}
              {board.bar.white > 0 && (
                <div className="my-1">
                  <CheckerPiece
                    color="white"
                    className="w-[24px] h-[24px] xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px]"
                    isSelected={selectedPoint === 'bar'}
                    stackCount={board.bar.white}
                    isClickable={turn === 'white'}
                  />
                </div>
              )}
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#b45309] tracking-widest rotate-90 sm:rotate-0 mt-1">
                BAR
              </span>
            </div>

            {/* Right Bottom Quadrant: Points 5 down to 0 (White's Home Board) */}
            <div className="flex flex-1 min-w-0 gap-0.5 sm:gap-1">
              {[5, 4, 3, 2, 1, 0].map(idx => renderPointColumn(idx, false))}
            </div>

            {/* White Bearing Off Tray (Bottom Right) */}
            <div
              onClick={() => {
                const targetOff = validTargets.find(t => t.to === 'off');
                if (targetOff) {
                  handleTargetClick(targetOff);
                }
              }}
              className={`w-7 xs:w-9 sm:w-12 shrink-0 bg-[#1e1008] border-l-2 border-[#452312] flex flex-col items-center justify-end p-1 sm:p-1.5 ${
                validTargets.some(t => t.to === 'off')
                  ? 'ring-2 ring-[#10b981] cursor-pointer bg-[#064e3b]/30'
                  : ''
              }`}
            >
              <div className="w-full flex-1 rounded border border-[#3b1f10] bg-[#140b05] flex flex-col items-center justify-end p-0.5 sm:p-1 space-y-1">
                {Array.from({ length: Math.min(6, board.borneOff.white) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-1.5 sm:h-2 rounded-sm bg-gradient-to-r from-[#fef3c7] to-[#e6cca5] border border-[#d97706]/70 shadow-sm"
                  />
                ))}
              </div>
              <span className="text-[7px] sm:text-[8px] font-bold text-[#a88a6d] mt-1">TOPLA</span>
              {isAdvisorEnabled && adviceResult.bestAdvice?.move.to === 'off' && (
                <span className="text-[7px] sm:text-[8px] font-black text-emerald-400 animate-pulse bg-emerald-500/20 px-1 rounded border border-emerald-400/40 mt-0.5">
                  👑 USTA
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UNIFIED FIXED-HEIGHT ACTION DOCK (ADVISOR & QUICK CHAT SOUNDS) - ZERO LAYOUT SHIFT */}
      <InGameActionDock
        advice={turn === 'white' && remainingMoves.length > 0 ? adviceResult.bestAdvice : null}
        alternatives={turn === 'white' && remainingMoves.length > 0 ? adviceResult.alternativeAdvices : []}
        isAdvisorEnabled={isAdvisorEnabled}
        onToggleAdvisor={() => setIsAdvisorEnabled(prev => !prev)}
        onApplyMove={handleApplyAdvisedMove}
        isBlitz={isBlitz}
        masterStreak={masterStreak}
        onSendPhrase={handleSendPhrase}
        disabled={gameEnded}
        turn={turn}
        onOpenChatDrawer={() => setIsChatOpen(true)}
        chatVisibilityMode={chatVisibilityMode}
        onChangeChatVisibilityMode={setChatVisibilityMode}
      />

      {/* BOTTOM CONTROL DOCK & PLAYER HUD */}
      <div className="relative w-full flex items-center justify-between gap-1.5 sm:gap-3 mt-1 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-2xl bg-white/[0.05] border border-white/[0.12] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        {/* Real-time Player Speech Bubble */}
        <ChatBubbleOverlay message={chatVisibilityMode !== 'hidden' ? activePlayerBubble : null} position="bottom" />

        {/* Player Profile & Stats */}
        <div
          onClick={() => onOpenProfile?.()}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
          title="Kendi profilinizi ve hamle istatistiklerinizi açın"
        >
          <PlayerAvatar
            avatarUrl={userProfile.avatar || '/images/avatar_genc_cirak.jpg'}
            frameId={userProfile.frameId || 'frame_classic_wood'}
            size={38}
            onClick={onOpenCustomization}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-tavla font-bold text-xs sm:text-sm text-[#fef3c7] group-hover:text-amber-200 transition-colors truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                {userProfile.name}
              </span>
              <span className="text-[9px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded-full border border-amber-400/40">
                🪙 {userProfile.coins}
              </span>
              {isBlitz && (
                <span className="text-[9px] text-rose-300 font-bold bg-rose-500/25 px-1.5 py-0.2 rounded-full border border-rose-400/40 animate-pulse hidden xs:inline">
                  ⚡ 15s
                </span>
              )}
            </div>
            <div className="text-[9px] text-amber-200/70 hidden xs:block">
              {userProfile.title} · {userProfile.rating}P
            </div>
          </div>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Undo Move Button */}
          <button
            onClick={handleUndo}
            disabled={turnSnapshots.length <= 1 || turn !== 'white' || undosRemaining <= 0 || undoCooldownSeconds > 0}
            className={`relative group px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-serif-tavla text-[11px] sm:text-xs flex items-center gap-1 border transition-all duration-300 ${
              turnSnapshots.length > 1 && turn === 'white' && undosRemaining > 0 && undoCooldownSeconds === 0
                ? 'bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 border-amber-400/60 shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95'
                : 'bg-white/[0.04] text-amber-200/30 border-white/10 cursor-not-allowed'
            }`}
            title={
              undosRemaining <= 0
                ? 'Geri alma hakkınız tükendi'
                : undoCooldownSeconds > 0
                ? `Bekleme süresi: ${undoCooldownSeconds}s`
                : 'Son hamleyi geri al'
            }
          >
            <span>↩</span>
            <span className="hidden xs:inline">Geri Al</span>
            {undoCooldownSeconds > 0 ? (
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {undoCooldownSeconds}
              </span>
            ) : (
              <span
                className={`px-1 py-0.1 rounded-full text-[9px] font-bold ${
                  undosRemaining > 0 ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/40'
                }`}
              >
                {undosRemaining}
              </span>
            )}
          </button>

          {/* Chat Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="relative group px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full font-serif-tavla text-[11px] sm:text-xs flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-400/50 shadow-sm transition-all hover:scale-105 active:scale-95"
            title="Sohbet ve Nükteler"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Sohbet</span>
          </button>

          {/* Tea Spoon Clink Button */}
          <button
            onClick={handleTeaClink}
            className="relative group p-1.5 sm:p-2 rounded-full bg-white/[0.06] hover:bg-amber-500/25 text-amber-200 border border-white/15 hover:border-amber-400/50 transition-all hover:scale-105 active:scale-95 shadow"
            title="İnce belli çay kaşığını tıkırdat"
          >
            <span>☕</span>
          </button>

          {/* Desktop Secondary Action Buttons */}
          <div className="hidden md:flex items-center gap-1">
            {onOpenAudioSettings && (
              <button
                onClick={onOpenAudioSettings}
                className="p-1.5 rounded-full bg-white/[0.06] hover:bg-indigo-500/25 text-indigo-200 border border-white/15 transition-all hover:scale-105"
                title="Ses Ayarları"
              >
                <span>📻</span>
              </button>
            )}
            {onOpenBoardStore && (
              <button
                onClick={onOpenBoardStore}
                className="p-1.5 rounded-full bg-white/[0.06] hover:bg-amber-500/25 text-amber-200 border border-white/15 transition-all hover:scale-105"
                title="Tahta Mağazası"
              >
                <span>🪵</span>
              </button>
            )}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-amber-200 border border-white/15 transition-all hover:scale-105"
              title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
            </button>
            <button
              onClick={onOpenStats}
              className="p-1.5 rounded-full bg-white/[0.06] hover:bg-rose-500/25 text-rose-200 border border-white/15 transition-all hover:scale-105"
              title="İstatistikler"
            >
              <span>📊</span>
            </button>
          </div>

          {/* Mobile Secondary Menu Toggle */}
          <div className="relative md:hidden">
            <button
              onClick={() => setIsMobileActionsOpen(prev => !prev)}
              className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-amber-200 border border-white/15 transition-all text-xs"
              title="Diğer Seçenekler"
            >
              <span>⚙️</span>
            </button>

            {/* Mobile Dropdown Popover */}
            {isMobileActionsOpen && (
              <div
                className="absolute bottom-10 right-0 z-50 w-44 rounded-xl bg-[#1c0f08]/98 border border-amber-400/50 shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-xl"
                onClick={() => setIsMobileActionsOpen(false)}
              >
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-amber-100 hover:bg-white/10"
                  >
                    <span>👤</span> <span>Profilim</span>
                  </button>
                )}
                {onOpenBoardStore && (
                  <button
                    onClick={onOpenBoardStore}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-amber-100 hover:bg-white/10"
                  >
                    <span>🪵</span> <span>Tahta Mağazası</span>
                  </button>
                )}
                {onOpenAudioSettings && (
                  <button
                    onClick={onOpenAudioSettings}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-amber-100 hover:bg-white/10"
                  >
                    <span>📻</span> <span>Ses &amp; Müzik</span>
                  </button>
                )}
                <button
                  onClick={toggleMute}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-amber-100 hover:bg-white/10"
                >
                  <span>{isMuted ? '🔊 Sesi Aç' : '🔇 Sesi Kapat'}</span>
                </button>
                <button
                  onClick={onOpenStats}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-amber-100 hover:bg-white/10"
                >
                  <span>📊</span> <span>İstatistikler</span>
                </button>
                <div className="h-px bg-white/10 my-0.5" />
                <button
                  onClick={onBackToLobby}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-rose-300 hover:bg-rose-500/20"
                >
                  <span>🚪</span> <span>Masadan Kalk</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Player Borne Off Counter & Turn Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-[#a88a6d] uppercase tracking-wider font-semibold">
              Toplanan
            </span>
            <div className="flex items-center gap-0.5">
              <span className="font-serif-tavla font-bold text-sm sm:text-base text-[#10b981]">
                {board.borneOff.white}
              </span>
              <span className="text-[10px] sm:text-xs text-[#78350f]">/15</span>
            </div>
          </div>

          <div
            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 border ${
              turn === 'white'
                ? 'bg-[#10b981]/20 border-[#34d399] text-[#6ee7b7] animate-pulse'
                : 'bg-[#1c120b] border-[#78350f]/40 text-[#a88a6d]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                turn === 'white' ? 'bg-[#34d399]' : 'bg-[#78350f]'
              }`}
            />
            <span className="hidden xs:inline">{turn === 'white' ? 'Sıra Sizde' : 'Rakipte'}</span>
          </div>
        </div>
      </div>

      {/* Google AdMob Compact Dock Strip */}
      <AdMobBanner format="dock_strip" className="mt-1 mb-1" />

      {/* Real-time Coffeehouse Chat Drawer Modal */}
      <CoffeehouseChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        isConnected={isChatConnected}
        cooldownSeconds={chatCooldown}
        onSendPhrase={handleSendPhrase}
      />
    </div>
  );
};
