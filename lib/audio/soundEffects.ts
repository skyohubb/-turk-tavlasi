'use client';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientVolume: number = 0.35; // 0..1
  private sfxVolume: number = 0.8;      // 0..1
  private isAmbientPlaying: boolean = false;
  private ambientInterval: NodeJS.Timeout | null = null;
  private ambientGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('tavla_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedAmbVol = localStorage.getItem('tavla_ambient_volume');
      if (savedAmbVol !== null) {
        this.ambientVolume = parseFloat(savedAmbVol);
      }
      const savedSfxVol = localStorage.getItem('tavla_sfx_volume');
      if (savedSfxVol !== null) {
        this.sfxVolume = parseFloat(savedSfxVol);
      }
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.sfxGainNode) {
      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGainNode.connect(this.ctx.destination);
    }
    if (this.ctx && !this.ambientGainNode) {
      this.ambientGainNode = this.ctx.createGain();
      this.ambientGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.ambientVolume, this.ctx.currentTime);
      this.ambientGainNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tavla_muted', String(this.isMuted));
    }
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.ambientVolume, this.ctx.currentTime);
    }
    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('tavla_ambient_volume', String(this.ambientVolume));
    }
    if (this.ambientGainNode && this.ctx && !this.isMuted) {
      this.ambientGainNode.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    }
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('tavla_sfx_volume', String(this.sfxVolume));
    }
    if (this.sfxGainNode && this.ctx && !this.isMuted) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // --- AUTHENTIC KAHVEHANE AMBIENT SOUNDSCAPE ENGINE ---
  // Generates traditional Turkish coffeehouse atmosphere:
  // 1. Gentle traditional Ney / Oud melodic drone in Hijaz / Rast makam
  // 2. Distant murmur of old chatter and laughter
  // 3. Occasional tea glasses clinking and spoon swirls
  // 4. Distant backgammon dice rolling on wooden tables
  public startAmbientAmbience() {
    if (this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;
    const ctx = this.initCtx();
    if (!ctx) return;

    // Start background acoustic texture and trigger periodic organic sound events
    const triggerAmbientEvents = () => {
      if (!this.isAmbientPlaying || this.isMuted) return;

      const diceChance = Math.random();
      if (diceChance > 0.4) {
        // Distant dice roll from a neighboring table
        this.playDistantTavlaRoll();
      }

      const teaChance = Math.random();
      if (teaChance > 0.3) {
        // Distant tea glass clink or spoon swirl
        this.playDistantTeaClink();
      }

      const murmurChance = Math.random();
      if (murmurChance > 0.5) {
        // Gentle coffeehouse warm murmur swell
        this.playGentleMurmurSwell();
      }

      // Traditional Oud acoustic note touch
      if (Math.random() > 0.45) {
        this.playTraditionalOudPluck();
      }
    };

    // Initial triggers
    triggerAmbientEvents();
    this.ambientInterval = setInterval(triggerAmbientEvents, 3200);
  }

  public stopAmbientAmbience() {
    this.isAmbientPlaying = false;
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  // Distant warm dice tumbling in background coffeehouse
  private playDistantTavlaRoll() {
    const ctx = this.initCtx();
    if (!ctx || !this.ambientGainNode || this.isMuted) return;

    const clicks = [0, 0.08, 0.16, 0.23];
    const baseTime = ctx.currentTime + Math.random() * 0.5;

    clicks.forEach((offset, idx) => {
      const t = baseTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Muffled lowpass filter to sound in the far corner of room
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, t);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 90, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.05);

      const amp = idx === clicks.length - 1 ? 0.08 : 0.04;
      gain.gain.setValueAtTime(amp * this.ambientVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGainNode!);

      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  // Distant thin Turkish tea glass spoon swirling
  private playDistantTeaClink() {
    const ctx = this.initCtx();
    if (!ctx || !this.ambientGainNode || this.isMuted) return;

    const baseTime = ctx.currentTime + Math.random() * 0.4;
    const clinks = [0, 0.06, 0.14];
    clinks.forEach(offset => {
      const t = baseTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600 + Math.random() * 400, t);

      gain.gain.setValueAtTime(0.06 * this.ambientVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ambientGainNode!);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // Subtle warm coffeehouse murmur & ambient reverb
  private playGentleMurmurSwell() {
    const ctx = this.initCtx();
    if (!ctx || !this.ambientGainNode || this.isMuted) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, t);
    filter.Q.value = 2;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110 + Math.random() * 30, t);
    osc.frequency.linearRampToValueAtTime(115, t + 1.2);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.035 * this.ambientVolume, t + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGainNode!);

    osc.start(t);
    osc.stop(t + 1.9);
  }

  // Traditional Turkish Oud / Tanbur Pluck (Hicaz Makam Notes: D, Eb, F#, G, A)
  private playTraditionalOudPluck() {
    const ctx = this.initCtx();
    if (!ctx || !this.ambientGainNode || this.isMuted) return;

    const hicazNotes = [146.83, 155.56, 185.00, 196.00, 220.00, 293.66]; // D3, Eb3, F#3, G3, A3, D4
    const chosenFreq = hicazNotes[Math.floor(Math.random() * hicazNotes.length)];
    const t = ctx.currentTime + Math.random() * 0.3;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.8);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(chosenFreq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(chosenFreq * 2, t);

    const amp = 0.08 * this.ambientVolume;
    gain.gain.setValueAtTime(amp, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGainNode!);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.3);
    osc2.stop(t + 1.3);
  }

  // --- AUTHENTIC TURKISH COFFEEHOUSE LIVE INTERACTION SOUNDS ---

  // Authentic Turkish Tea Spoon & Glass Clink
  public playAuthenticTeaClink() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const baseTime = ctx.currentTime;
    const clinks = [0, 0.05, 0.12, 0.22];
    clinks.forEach((offset, idx) => {
      const t = baseTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600 + Math.random() * 450, t);
      osc.frequency.exponentialRampToValueAtTime(2400, t + 0.18);

      const vol = idx === 0 ? 0.35 : idx === 1 ? 0.25 : 0.15;
      gain.gain.setValueAtTime(vol * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  // Traditional Ottoman Oud / Kanun Solo Phrase (Hicaz Makam)
  public playOudSolo() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    // Hicaz Makamı Dizi: Re, Mi bemol, Fa diyez, Sol, La, Si bemol, Do, Re
    const hicazScale = [293.66, 311.13, 369.99, 392.00, 440.00, 466.16, 523.25, 587.33];
    // Melodic ornament phrase
    const phrase = [0, 1, 2, 3, 2, 1, 0];
    const baseTime = ctx.currentTime;

    phrase.forEach((noteIdx, step) => {
      const t = baseTime + step * 0.14;
      const freq = hicazScale[noteIdx];

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(500, t + 0.5);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);

      gain.gain.setValueAtTime(0.28 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.65);
      osc2.stop(t + 0.65);
    });
  }

  // Deep satisfying wooden checker slam ("ŞAK!")
  public playHeavyCheckerSlam() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;

    // 1. High transient crack of polished walnut
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(1200, t);
    crackOsc.frequency.exponentialRampToValueAtTime(250, t + 0.03);
    crackGain.gain.setValueAtTime(0.5 * this.sfxVolume, t);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    crackOsc.connect(crackGain);
    crackGain.connect(this.sfxGainNode!);
    crackOsc.start(t);
    crackOsc.stop(t + 0.05);

    // 2. Heavy hardwood board body resonance thud
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);

    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(160, t);
    thudOsc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    thudGain.gain.setValueAtTime(0.7 * this.sfxVolume, t);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    thudOsc.connect(filter);
    filter.connect(thudGain);
    thudGain.connect(this.sfxGainNode!);
    thudOsc.start(t);
    thudOsc.stop(t + 0.18);
  }

  // Authentic leather cup shake and crisp roll on wood/felt
  public playDiceCupShake() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    // 4 cup rattle shakes
    const baseTime = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = baseTime + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350 + Math.random() * 150, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.04);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGainNode!);
      osc.start(t);
      osc.stop(t + 0.06);
    }
    // Ending roll drop
    setTimeout(() => {
      this.playDiceRoll();
    }, 280);
  }

  // --- GAMEPLAY SOUND EFFECTS ---

  // Realistic Leather Cup Dice Shaking
  public playDiceShake() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    for (let i = 0; i < 4; i++) {
      const startTime = ctx.currentTime + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 200, startTime);
      osc.frequency.exponentialRampToValueAtTime(120, startTime + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 400, startTime);
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(startTime);
      osc.stop(startTime + 0.05);
    }
  }

  // Dice Rolling & Tumbling on Hardwood Board
  public playDiceRoll() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const clicks = [0, 0.07, 0.15, 0.22, 0.3];
    clicks.forEach((timeOffset, idx) => {
      const startTime = ctx.currentTime + timeOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const isFinal = idx === clicks.length - 1;
      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 160 : 380 + Math.random() * 140, startTime);
      osc.frequency.exponentialRampToValueAtTime(80, startTime + (isFinal ? 0.08 : 0.04));

      gain.gain.setValueAtTime((isFinal ? 0.3 : 0.15) * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + (isFinal ? 0.09 : 0.04));

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(startTime);
      osc.stop(startTime + (isFinal ? 0.1 : 0.05));
    });
  }

  // Solid Hardwood Checker Placed on Board
  public playCheckerDrop() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Dramatic "Vurgun" (Checker Hit / Kırma) Sound
  public playCheckerHit() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    
    // Sharp high wood knock
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(650, t);
    osc1.frequency.exponentialRampToValueAtTime(200, t + 0.07);
    gain1.gain.setValueAtTime(0.25 * this.sfxVolume, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.sfxGainNode);
    osc1.start(t);
    osc1.stop(t + 0.09);

    // Deep resonance thud
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220, t + 0.01);
    osc2.frequency.exponentialRampToValueAtTime(90, t + 0.12);
    gain2.gain.setValueAtTime(0.3 * this.sfxVolume, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc2.connect(gain2);
    gain2.connect(this.sfxGainNode);
    osc2.start(t + 0.01);
    osc2.stop(t + 0.14);
  }

  // Smooth Checker Slide on Felt/Lacquer
  public playCheckerSlide() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(340, t + 0.08);
    osc.frequency.linearRampToValueAtTime(220, t + 0.14);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Authentic Turkish Kahvehane Tea Glass Spoon Clinking
  public playTeaGlassChime() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const notes = [2800, 3200, 3100];
    notes.forEach((freq, idx) => {
      const t = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  public playTeaClink() {
    this.playTeaGlassChime();
  }

  // Soft Undo Move Feedback
  public playUndo() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.1);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Gold Coin / Akçe Reward Chime
  public playCoinReward() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const freqs = [987.77, 1318.51, 1567.98]; // B5, E6, G6
    freqs.forEach((f, i) => {
      const t = ctx.currentTime + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.16 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  // Victory Fanfare & Mars Triumph
  public playVictory(isMars: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const notes = isMars 
      ? [261.63, 329.63, 392.00, 523.25, 659.25, 783.99] // Full glorious C Major triumph
      : [261.63, 329.63, 392.00, 523.25];

    notes.forEach((freq, idx) => {
      const t = ctx.currentTime + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t);
      osc.stop(t + 0.55);
    });
  }

  // Real-Time Chat Speech Bubble Pop
  public playChatPop() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Voice Phrase Megaphone / Authentic Accent Sound
  public playVoicePhraseAccent(frequency: number = 740) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency * 0.75, t);
    osc.frequency.exponentialRampToValueAtTime(frequency, t + 0.08);

    gain.gain.setValueAtTime(0.14 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.24);
  }
}

export const soundEffects = new SoundEngine();

