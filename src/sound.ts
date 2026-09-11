// Synthesize playful classroom sound effects using the Web Audio API.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      // Support standard and prefixed AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn("Web Audio API not supported in this browser.", e);
    }
  }
  // Resume context if it was suspended (autoplay policy)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a cute "correct answer" chime arpeggio
 */
export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (C Major Chord)
  
  notes.forEach((freq, index) => {
    const time = now + index * 0.1;
    
    // Create oscillator
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    
    // Sparkly envelope
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.15, time + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.5);
  });
}

/**
 * Play an "incorrect answer" soft cute buzzer
 */
export function playIncorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // High-to-low warning tone
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(180, now);
  osc1.frequency.linearRampToValueAtTime(120, now + 0.3);
  
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  osc1.start(now);
  osc1.stop(now + 0.4);

  // Slightly delayed secondary buzzer
  osc2.type = "sawtooth"; // low volume sawtooth for a slightly buzzy but gentle sound
  osc2.frequency.setValueAtTime(110, now + 0.05);
  osc2.frequency.linearRampToValueAtTime(90, now + 0.35);
  
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.05, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.start(now + 0.05);
  osc2.stop(now + 0.45);
}

/**
 * Play a brief organic bubble pop sound for clicking or picking up a word
 */
export function playGrabSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Play a cute snapping or woody pop sound when a word is dropped or slotted in
 */
export function playDropSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * Speech Synthesis Helper with selectable voice, rate, and pitch
 */
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const allVoices = window.speechSynthesis.getVoices();
  // Filter for English voices (en-US, en-GB, en-AU, etc.)
  const englishVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith("en"));
  return englishVoices.length > 0 ? englishVoices : allVoices;
}

export function speakEnglishSentence(
  text: string,
  options?: {
    rate?: number;
    voiceURI?: string;
    pitch?: number;
    onEnd?: () => void;
  }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported.");
    return;
  }

  try {
    // Cancel any previous speech to avoid overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = options?.rate ?? 0.85;
    utterance.pitch = options?.pitch ?? 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (options?.voiceURI && voices.length > 0) {
      const selected = voices.find(v => v.voiceURI === options.voiceURI || v.name === options.voiceURI);
      if (selected) {
        utterance.voice = selected;
        utterance.lang = selected.lang;
      }
    } else {
      // Default to US or GB English voice if available
      const preferred = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB"));
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    if (options?.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Speech synthesis failed", err);
    if (options?.onEnd) options.onEnd();
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

