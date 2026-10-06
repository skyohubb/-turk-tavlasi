'use client';

export interface VoicePhrase {
  id: string;
  label: string;
  phrase: string;
  emoji: string;
  soundPitch?: number; // TTS pitch
  soundRate?: number;  // TTS rate
  soundToneFreq?: number; // Web Audio complementary acoustic accent
}

export const AUTHENTIC_VOICE_PHRASES: VoicePhrase[] = [
  {
    id: 'duses',
    label: 'Düşeş!',
    phrase: 'Düşeş! Zarlar konuştu usta!',
    emoji: '🎲',
    soundPitch: 1.15,
    soundRate: 1.05,
    soundToneFreq: 880,
  },
  {
    id: 'vay_canina',
    label: 'Vay canına!',
    phrase: 'Vay canına, böyle zar görülmedi!',
    emoji: '😲',
    soundPitch: 1.1,
    soundRate: 1.0,
    soundToneFreq: 740,
  },
  {
    id: 'kismet_degilmis',
    label: 'Kısmet değilmiş',
    phrase: 'Kısmet değilmiş be usta, sağlık olsun.',
    emoji: '🍵',
    soundPitch: 0.95,
    soundRate: 0.95,
    soundToneFreq: 520,
  },
  {
    id: 'ses_bes',
    label: 'Şeş-Beş!',
    phrase: 'Şeş-beş geldi, kapılar ardına kadar açıldı!',
    emoji: '⚡',
    soundPitch: 1.2,
    soundRate: 1.1,
    soundToneFreq: 920,
  },
  {
    id: 'mars_kapida',
    label: 'Mars kapıda!',
    phrase: 'Mars kapıda göründü, topla pulları!',
    emoji: '🔥',
    soundPitch: 1.1,
    soundRate: 1.05,
    soundToneFreq: 660,
  },
  {
    id: 'cayci',
    label: 'Çaycııı!',
    phrase: 'Çaycııı! Masaya tavşan kanı taze çay çek!',
    emoji: '☕',
    soundPitch: 1.25,
    soundRate: 1.15,
    soundToneFreq: 1040,
  },
  {
    id: 'bilegine_saglik',
    label: 'Bileğine sağlık!',
    phrase: 'Bileğine sağlık usta, güzel hamleydi.',
    emoji: '🤝',
    soundPitch: 1.0,
    soundRate: 1.0,
    soundToneFreq: 587,
  },
  {
    id: 'zar_tutma',
    label: 'Zar tutma usta!',
    phrase: 'Zar tutma usta, bileğine güven!',
    emoji: '😉',
    soundPitch: 1.05,
    soundRate: 1.05,
    soundToneFreq: 620,
  },
];

class VoicePhraseEngine {
  private turkishVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Look for Turkish voices
    const trVoice = voices.find(v => v.lang.startsWith('tr') || v.lang.includes('TR'));
    if (trVoice) {
      this.turkishVoice = trVoice;
    }
    this.voicesLoaded = true;
  }

  public speak(phrase: VoicePhrase, onStart?: () => void, onEnd?: () => void) {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop prior speech

        const utterance = new SpeechSynthesisUtterance(phrase.phrase);
        utterance.lang = 'tr-TR';
        utterance.pitch = phrase.soundPitch || 1.0;
        utterance.rate = phrase.soundRate || 1.0;
        utterance.volume = 1.0;

        if (this.turkishVoice) {
          utterance.voice = this.turkishVoice;
        } else {
          // Retry finding Turkish voice
          const voices = window.speechSynthesis.getVoices();
          const trVoice = voices.find(v => v.lang.startsWith('tr') || v.lang.includes('TR'));
          if (trVoice) {
            utterance.voice = trVoice;
            this.turkishVoice = trVoice;
          }
        }

        if (onStart) utterance.onstart = onStart;
        if (onEnd) utterance.onend = onEnd;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    }
  }
}

export const voicePhraseEngine = new VoicePhraseEngine();
