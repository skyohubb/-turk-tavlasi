'use client';

// Yerel (sunucusuz) kahvehane sohbeti — v1.0
// Tüm mesajlar cihazda üretilir: oyuncu hazır kalıplardan seçer, yapay zeka
// rakibi karakterine uygun cevabı yerleşik repliklerden verir.
// Ağ isteği YOK: SSE yok, POST yok, Netlify fonksiyonu tüketmez.

import { useState, useRef, useCallback } from 'react';
import { ChatMessage, OPPONENT_COFFEEHOUSE_REACTIONS } from '@/lib/tavla/chatPhrases';
import { soundEffects } from '@/lib/audio/soundEffects';

interface UseTavlaChatOptions {
  matchId: string;
  playerName: string;
  playerAvatar: string;
  opponentId?: string;
  opponentName?: string;
  opponentAvatar?: string;
  isAiMatch?: boolean;
}

const OPPONENT_AVATARS: Record<string, string> = {
  haci_dayi: '/images/avatar_haci_dayi.jpg',
  cayci_rustem: '/images/avatar_cayci_rustem.jpg',
  mahmut_emmi: '/images/avatar_mahmut_emmi.jpg',
  genc_emre: '/images/avatar_genc_emre.jpg',
  muallim_hikmet: '/images/avatar_emekli_hoca.jpg',
  usta_selim: '/images/avatar_usta_selim.jpg',
  beyoglu_centilmeni: '/images/avatar_beyoglu_centilmeni.jpg',
};

function pickLocalReply(opponentId: string | undefined, playerPhrase: string): string {
  const key = opponentId && opponentId in OPPONENT_COFFEEHOUSE_REACTIONS ? opponentId : 'haci_dayi';
  const data =
    OPPONENT_COFFEEHOUSE_REACTIONS[key] || OPPONENT_COFFEEHOUSE_REACTIONS.haci_dayi;
  // Oyuncunun cümlesindeki anahtar kelimeyle eşleşen varsa onu öne al (basit bağlam hissi)
  const lower = playerPhrase.toLocaleLowerCase('tr');
  const triggerHit = data.triggers.some(t => lower.includes(t));
  const replies = data.replies;
  const idx = Math.floor(Math.random() * replies.length);
  // Eşleşme varsa rastgele değil, kelimeye göre sabit sıradaki cevabı ver (tutarlılık hissi)
  if (triggerHit) return replies[playerPhrase.length % replies.length];
  return replies[idx];
}

export function useTavlaChat({
  matchId,
  playerName,
  playerAvatar,
  opponentId,
  opponentName,
  opponentAvatar,
  isAiMatch = true,
}: UseTavlaChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activePlayerBubble, setActivePlayerBubble] = useState<ChatMessage | null>(null);
  const [activeOpponentBubble, setActiveOpponentBubble] = useState<ChatMessage | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const playerBubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opponentBubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev.slice(-49), msg]);
    soundEffects.playChatPop();
    if (msg.sender === 'player') {
      setActivePlayerBubble(msg);
      if (playerBubbleTimeoutRef.current) clearTimeout(playerBubbleTimeoutRef.current);
      playerBubbleTimeoutRef.current = setTimeout(() => setActivePlayerBubble(null), 5000);
    } else if (msg.sender === 'opponent') {
      setActiveOpponentBubble(msg);
      if (opponentBubbleTimeoutRef.current) clearTimeout(opponentBubbleTimeoutRef.current);
      opponentBubbleTimeoutRef.current = setTimeout(() => setActiveOpponentBubble(null), 5500);
    }
  }, []);

  // Hazır kalıp gönder (serbest yazı YOK — UI sadece kalıp butonu gösterir)
  const sendPhrase = useCallback(
    async (phrase: string, categoryIcon: string = '💬') => {
      if (cooldownSeconds > 0) return false;
      const clean = phrase.trim().slice(0, 120);
      if (!clean) return false;

      setCooldownSeconds(2);
      if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = setTimeout(() => setCooldownSeconds(0), 2000);

      pushMessage({
        id: `msg_local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        matchId,
        sender: 'player',
        senderName: playerName,
        avatar: playerAvatar,
        phrase: clean,
        categoryIcon,
        timestamp: Date.now(),
      });

      // Yapay zeka rakibi ~1.4 sn sonra yerelden cevap verir
      if (isAiMatch) {
        const replyText = pickLocalReply(opponentId, clean);
        setTimeout(() => {
          pushMessage({
            id: `msg_opp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            matchId,
            sender: 'opponent',
            senderName: opponentName || 'Rakip Usta',
            avatar: opponentAvatar || OPPONENT_AVATARS[opponentId || ''] || '/images/avatar_haci_dayi.jpg',
            phrase: replyText,
            categoryIcon: '☕',
            timestamp: Date.now(),
          });
        }, 1400);
      }
      return true;
    },
    [cooldownSeconds, matchId, playerName, playerAvatar, opponentId, opponentName, opponentAvatar, isAiMatch, pushMessage]
  );

  return {
    messages,
    isConnected: true, // yerel mod her zaman "bağlı"
    activePlayerBubble,
    activeOpponentBubble,
    cooldownSeconds,
    sendPhrase,
  };
}
