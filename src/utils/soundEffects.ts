// Web Audio API sound generator for tactile clicks, shakes, and melodious chimes

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Pleasant 3-note ascending chime (C5 -> E5 -> G5)
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.55);
    });
  } catch (err) {
    console.warn('Audio playback not permitted yet:', err);
  }
}

export function playShakeSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Wooden / paper box shake noise
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 80, now + i * 0.08);
      
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.07);
    }
  } catch (err) {
    console.warn(err);
  }
}

export function playPopOpenSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (err) {
    console.warn(err);
  }
}

export function playKeypadClick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (err) {
    console.warn(err);
  }
}

// Gentle lullaby music synthesizer for voice memo fallback
export function playGentleMelodyVoice(
  onEnded?: () => void,
  onProgress?: (seconds: number) => void
): { stop: () => void; duration: number } {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 392.00, d: 0.6 }, // G4
      { f: 440.00, d: 0.6 }, // A4
      { f: 493.88, d: 0.8 }, // B4
      { f: 587.33, d: 1.0 }, // D5
      { f: 523.25, d: 0.8 }, // C5
      { f: 493.88, d: 0.6 }, // B4
      { f: 440.00, d: 1.2 }, // A4
      { f: 392.00, d: 0.8 }, // G4
      { f: 329.63, d: 0.8 }, // E4
      { f: 392.00, d: 1.5 }, // G4
    ];

    let offset = 0;
    const oscillators: OscillatorNode[] = [];
    
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + offset);
      
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.12, now + offset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + note.d);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + offset);
      osc.stop(now + offset + note.d + 0.1);
      oscillators.push(osc);
      
      offset += note.d;
    });

    const totalSeconds = Math.round(offset); // 9 seconds

    const interval = setInterval(() => {
      if (ctx) {
        const elapsed = ctx.currentTime - now;
        if (onProgress) {
          onProgress(Math.min(totalSeconds, Math.floor(elapsed)));
        }
      }
    }, 200);

    const timer = setTimeout(() => {
      clearInterval(interval);
      if (onProgress) {
        onProgress(totalSeconds);
      }
      if (onEnded) {
        onEnded();
      }
    }, (offset + 0.2) * 1000);

    return {
      duration: totalSeconds,
      stop: () => {
        clearInterval(interval);
        clearTimeout(timer);
        oscillators.forEach(o => {
          try { o.stop(); } catch { /* ignore */ }
        });
      }
    };
  } catch (err) {
    console.warn(err);
    if (onEnded) onEnded();
    return { stop: () => {}, duration: 9 };
  }
}
