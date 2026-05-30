"use client";

export function playNotificationSound(type: "message" | "meeting" | "reminder" | "announcement") {
  if (typeof window === "undefined") return;
  
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  
  const ctx = new AudioContextClass();
  const now = ctx.currentTime;
  
  if (type === "message") {
    // Soft chime: two rapid sine pulses (harmonic fifth)
    // Tone 1: E6 (1318.51 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.06, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: B6 (1567.98 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1567.98, now + 0.06);
    gain2.gain.setValueAtTime(0, now + 0.06);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.075);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.45);
  } 
  else if (type === "meeting") {
    // Richer tone: warm major triad chord
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.025);
      gain.gain.setValueAtTime(0, now + idx * 0.025);
      gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.025 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65 + idx * 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.025);
      osc.stop(now + 0.65 + idx * 0.025);
    });
  } 
  else if (type === "reminder") {
    // Gentle pulse: low-pass filtered triangle wave
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now); // A4
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.5);
  } 
  else if (type === "announcement") {
    // Quiet ambient cue: dual chime with warm sweep
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(329.63, now); // E4
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(493.88, now + 0.04); // B4
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 1.0);
    osc2.start(now + 0.04);
    osc2.stop(now + 1.0);
  }
}
