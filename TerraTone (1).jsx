import { useState, useEffect, useRef, useCallback } from "react";

// ── Palette & theme ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Syncopate:wght@400;700&family=Space+Mono&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void: #04070f;
    --deep: #080e1c;
    --mid: #0d1628;
    --surface: #111e35;
    --rim: #1a2d4a;
    --glow-blue: #3a7bd5;
    --glow-teal: #00c9a7;
    --glow-gold: #c9a84c;
    --glow-violet: #7c4dff;
    --text-primary: #e8edf5;
    --text-secondary: #7a8fa8;
    --text-muted: #3d5068;
    --sleep-color: #3a7bd5;
    --calm-color: #00c9a7;
    --focus-color: #c9a84c;
    --live-color: #7c4dff;
  }

  body {
    background: var(--void);
    color: var(--text-primary);
    font-family: 'Space Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* ── Star field background ── */
  .starfield {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .star {
    position: absolute;
    border-radius: 50%;
    background: white;
    animation: twinkle var(--dur, 4s) ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }
  @keyframes twinkle {
    0%, 100% { opacity: var(--min-op, 0.1); transform: scale(1); }
    50% { opacity: var(--max-op, 0.7); transform: scale(1.3); }
  }

  /* ── Earth pulse orb ── */
  .orb-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }
  .orb {
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 35%,
      rgba(58, 123, 213, 0.08) 0%,
      rgba(0, 201, 167, 0.04) 40%,
      transparent 70%
    );
    filter: blur(40px);
    animation: orbPulse 8s ease-in-out infinite;
  }
  @keyframes orbPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.15); opacity: 1; }
  }

  /* ── Layout ── */
  .content {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px 80px;
    width: 100%;
  }

  /* ── Header ── */
  .header {
    padding: 48px 0 40px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid var(--rim);
  }
  .logo-block {}
  .logo-eyebrow {
    font-family: 'Syncopate', sans-serif;
    font-size: 9px;
    letter-spacing: 4px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .logo-name {
    font-family: 'Syncopate', sans-serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 6px;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--glow-blue) 60%, var(--glow-teal) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .logo-sub {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 4px;
    letter-spacing: 1px;
  }
  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    padding-top: 8px;
  }
  .schumann-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: 4px;
    padding: 6px 12px;
  }
  .schumann-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--glow-teal);
    box-shadow: 0 0 8px var(--glow-teal);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .schumann-label {
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  .schumann-value {
    font-size: 13px;
    color: var(--glow-teal);
    font-weight: 400;
  }
  .premium-badge {
    font-family: 'Syncopate', sans-serif;
    font-size: 8px;
    letter-spacing: 2px;
    color: var(--glow-violet);
    border: 1px solid var(--glow-violet);
    padding: 3px 8px;
    border-radius: 2px;
    opacity: 0.8;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .premium-badge:hover { opacity: 1; }

  /* ── Waveform visualizer ── */
  .visualizer-wrap {
    margin: 40px 0 32px;
    position: relative;
  }
  .visualizer-label {
    font-family: 'Syncopate', sans-serif;
    font-size: 8px;
    letter-spacing: 3px;
    color: var(--text-muted);
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  canvas.waveform {
    width: 100%;
    height: 80px;
    display: block;
    border-radius: 4px;
  }

  /* ── Mode selector ── */
  .mode-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 40px;
  }
  .mode-btn {
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: 6px;
    padding: 16px 12px;
    cursor: pointer;
    transition: all 0.25s;
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  .mode-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.25s;
  }
  .mode-btn.sleep::before { background: radial-gradient(circle at 50% 0%, rgba(58,123,213,0.15), transparent 70%); }
  .mode-btn.calm::before  { background: radial-gradient(circle at 50% 0%, rgba(0,201,167,0.15), transparent 70%); }
  .mode-btn.focus::before { background: radial-gradient(circle at 50% 0%, rgba(201,168,76,0.15), transparent 70%); }
  .mode-btn.active::before, .mode-btn:hover::before { opacity: 1; }
  .mode-btn.active.sleep { border-color: var(--sleep-color); box-shadow: 0 0 20px rgba(58,123,213,0.2); }
  .mode-btn.active.calm  { border-color: var(--calm-color);  box-shadow: 0 0 20px rgba(0,201,167,0.2); }
  .mode-btn.active.focus { border-color: var(--focus-color); box-shadow: 0 0 20px rgba(201,168,76,0.2); }
  .mode-icon { font-size: 20px; margin-bottom: 8px; display: block; }
  .mode-name {
    font-family: 'Syncopate', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--text-primary);
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .mode-hz {
    font-size: 10px;
    color: var(--text-muted);
  }
  .mode-btn.active.sleep .mode-name { color: var(--sleep-color); }
  .mode-btn.active.calm  .mode-name { color: var(--calm-color); }
  .mode-btn.active.focus .mode-name { color: var(--focus-color); }

  /* ── Now playing ── */
  .now-playing {
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
  }
  .now-playing::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--glow-blue), transparent);
    animation: scanline 4s linear infinite;
  }
  @keyframes scanline {
    0% { opacity: 0; transform: translateX(-100%); }
    50% { opacity: 1; }
    100% { opacity: 0; transform: translateX(100%); }
  }
  .np-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .np-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 300;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .np-meta {
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 1px;
  }
  .np-kp {
    text-align: right;
  }
  .np-kp-label {
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .np-kp-value {
    font-family: 'Syncopate', sans-serif;
    font-size: 24px;
    color: var(--glow-teal);
  }
  .np-kp-desc {
    font-size: 9px;
    color: var(--glow-teal);
    opacity: 0.7;
  }

  /* ── Progress bar ── */
  .progress-wrap {
    margin-bottom: 16px;
  }
  .progress-track {
    height: 2px;
    background: var(--rim);
    border-radius: 1px;
    cursor: pointer;
    position: relative;
    margin-bottom: 8px;
  }
  .progress-fill {
    height: 100%;
    border-radius: 1px;
    background: linear-gradient(90deg, var(--glow-blue), var(--glow-teal));
    transition: width 0.5s linear;
    position: relative;
  }
  .progress-fill::after {
    content: '';
    position: absolute;
    right: -3px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--glow-teal);
    box-shadow: 0 0 8px var(--glow-teal);
  }
  .progress-times {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--text-muted);
  }

  /* ── Controls ── */
  .controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .ctrl-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ctrl-btn:hover { color: var(--text-primary); background: var(--rim); }
  .play-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--glow-blue), var(--glow-teal));
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(58,123,213,0.4);
    flex-shrink: 0;
  }
  .play-btn:hover { transform: scale(1.08); box-shadow: 0 0 30px rgba(58,123,213,0.6); }
  .play-btn.playing { background: linear-gradient(135deg, var(--glow-teal), var(--glow-blue)); }
  .volume-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .volume-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 80px;
    height: 2px;
    background: var(--rim);
    border-radius: 1px;
    outline: none;
  }
  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--glow-teal);
    cursor: pointer;
  }

  /* ── Section header ── */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Syncopate', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  .section-count {
    font-size: 10px;
    color: var(--text-muted);
  }

  /* ── Library grid ── */
  .library {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 48px;
  }
  .lib-item {
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: 6px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .lib-item:hover { border-color: rgba(58,123,213,0.4); background: var(--mid); }
  .lib-item.active { border-color: var(--glow-blue); background: var(--mid); }
  .lib-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--glow-blue), var(--glow-teal));
  }
  .lib-mode-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .lib-mode-dot.sleep  { background: var(--sleep-color); box-shadow: 0 0 6px var(--sleep-color); }
  .lib-mode-dot.calm   { background: var(--calm-color);  box-shadow: 0 0 6px var(--calm-color); }
  .lib-mode-dot.focus  { background: var(--focus-color); box-shadow: 0 0 6px var(--focus-color); }
  .lib-info { flex: 1; min-width: 0; }
  .lib-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 4px;
    line-height: 1.4;
  }
  .lib-mode-tag {
    font-family: 'Syncopate', sans-serif;
    font-size: 8px;
    letter-spacing: 2px;
    color: var(--glow-teal);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .lib-meta {
    font-size: 9px;
    color: var(--text-muted);
    letter-spacing: 0.5px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    line-height: 1.5;
  }
  .lib-kp {
    text-align: right;
    flex-shrink: 0;
  }
  .lib-kp-val {
    font-size: 12px;
    color: var(--glow-teal);
    margin-bottom: 2px;
  }
  .lib-kp-label {
    font-size: 9px;
    color: var(--text-muted);
  }
  .lib-duration {
    font-size: 10px;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .lib-play-icon {
    color: var(--text-muted);
    font-size: 12px;
    flex-shrink: 0;
    transition: color 0.2s;
  }
  .lib-item:hover .lib-play-icon,
  .lib-item.active .lib-play-icon { color: var(--glow-teal); }

  /* ── Premium Live banner ── */
  .live-banner {
    background: linear-gradient(135deg, rgba(124,77,255,0.15), rgba(58,123,213,0.1));
    border: 1px solid rgba(124,77,255,0.4);
    border-radius: 8px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 48px;
    position: relative;
    overflow: hidden;
  }
  .live-banner::before {
    content: 'PREMIUM';
    position: absolute;
    top: 10px; right: 12px;
    font-family: 'Syncopate', sans-serif;
    font-size: 7px;
    letter-spacing: 3px;
    color: var(--glow-violet);
    opacity: 0.8;
  }
  .live-banner:hover { border-color: var(--glow-violet); box-shadow: 0 0 30px rgba(124,77,255,0.2); }
  .live-orb {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,77,255,0.6), rgba(58,123,213,0.3));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    animation: liveOrbPulse 3s ease-in-out infinite;
    box-shadow: 0 0 20px rgba(124,77,255,0.4);
  }
  @keyframes liveOrbPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(124,77,255,0.4); }
    50% { box-shadow: 0 0 40px rgba(124,77,255,0.7); }
  }
  .live-text {}
  .live-title {
    font-family: 'Syncopate', sans-serif;
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--glow-violet);
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .live-desc {
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px;
    font-weight: 300;
    color: var(--text-secondary);
    line-height: 1.5;
  }
  .live-cta {
    margin-left: auto;
    font-family: 'Syncopate', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--glow-violet);
    background: rgba(124,77,255,0.15);
    border: 1px solid rgba(124,77,255,0.4);
    padding: 10px 16px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .live-banner:hover .live-cta { background: rgba(124,77,255,0.25); }

  /* ── Waveform bars animation ── */
  .bars-wrap {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 20px;
  }
  .bar {
    width: 3px;
    border-radius: 2px;
    background: var(--glow-teal);
    animation: barAnim var(--spd) ease-in-out infinite;
    animation-delay: var(--d);
  }
  @keyframes barAnim {
    0%, 100% { height: 4px; }
    50% { height: var(--h); }
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: 6px;
    padding: 12px 20px;
    font-size: 12px;
    color: var(--text-secondary);
    transition: transform 0.3s ease;
    z-index: 100;
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }

  /* ── Delete warning ── */
  .delete-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    color: var(--text-muted);
    margin-top: -32px;
    margin-bottom: 40px;
    padding: 0 4px;
  }
  .delete-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--text-muted);
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .header { flex-direction: column; gap: 20px; }
    .header-right { align-items: flex-start; }
    .mode-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .mode-btn { padding: 12px 8px; }
    .np-top { flex-direction: column; gap: 12px; }
    .live-banner { flex-direction: column; }
    .live-cta { margin-left: 0; }
    .volume-wrap { display: none; }
  }
`;

// ── Data ────────────────────────────────────────────────────────────────────

const MODES = {
  sleep: { label: "SLEEP",  icon: "◐", hz: "Delta · 2 Hz",   color: "#3a7bd5", binaural: 2,  carrier: 100 },
  calm:  { label: "CALM",   icon: "◎", hz: "Theta · 6 Hz",   color: "#00c9a7", binaural: 6,  carrier: 120 },
  focus: { label: "FOCUS",  icon: "◈", hz: "Alpha · 10 Hz",  color: "#c9a84c", binaural: 10, carrier: 200 },
};

const KP_LABELS = {
  low:    "Very Calm",
  medium: "Moderate",
  high:   "Elevated",
};

function getKpLabel(kp) {
  if (kp < 2) return KP_LABELS.low;
  if (kp < 5) return KP_LABELS.medium;
  return KP_LABELS.high;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " + date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Generate a week of library entries (every 3 hours)
function generateLibrary() {
  const entries = [];
  const modeKeys = ["sleep", "calm", "focus"];
  const now = new Date();
  for (let i = 0; i < 56; i++) {
    const date = new Date(now - i * 3 * 60 * 60 * 1000);
    const kp = parseFloat((Math.random() * 4).toFixed(1));
    const schumann = parseFloat((7.83 + (Math.random() - 0.5) * 0.8).toFixed(3));
    const mode = modeKeys[i % 3];
    const daysLeft = Math.max(1, 7 - Math.floor(i / 8));
    entries.push({
      id: i,
      date,
      label: formatDate(date),
      mode,
      kp,
      kpLabel: getKpLabel(kp),
      schumann,
      duration: "∞",
      daysLeft,
      title: `${MODES[mode].label} · ${formatDate(date)}`,
    });
  }
  return entries;
}

// ── Audio engine (Web Audio API) ─────────────────────────────────────────────

function buildAudio(ctx, mode, kp) {
  const m = MODES[mode];
  const schumann = 7.83 + (kp / 9) * 1.0 - 0.5;
  const nodes = [];

  // Left carrier
  const oscL = ctx.createOscillator();
  oscL.frequency.value = m.carrier;
  oscL.type = "sine";
  const gainL = ctx.createGain();
  gainL.gain.value = 0;
  oscL.connect(gainL);

  // Right carrier
  const oscR = ctx.createOscillator();
  oscR.frequency.value = m.carrier + m.binaural;
  oscR.type = "sine";
  const gainR = ctx.createGain();
  gainR.gain.value = 0;
  oscR.connect(gainR);

  // Schumann layer (scaled to audible)
  const oscS = ctx.createOscillator();
  oscS.frequency.value = schumann * 5;
  oscS.type = "sine";
  const gainS = ctx.createGain();
  gainS.gain.value = 0;
  oscS.connect(gainS);

  // Stereo merger
  const merger = ctx.createChannelMerger(2);
  gainL.connect(merger, 0, 0);
  gainR.connect(merger, 0, 1);
  gainS.connect(merger, 0, 0);
  gainS.connect(merger, 0, 1);

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.7;
  merger.connect(masterGain);
  masterGain.connect(ctx.destination);

  oscL.start(); oscR.start(); oscS.start();

  // Fade in
  const now = ctx.currentTime;
  gainL.gain.setTargetAtTime(0.55, now, 1.5);
  gainR.gain.setTargetAtTime(0.55, now, 1.5);
  gainS.gain.setTargetAtTime(0.12, now, 1.5);

  return {
    stop: () => {
      const t = ctx.currentTime;
      gainL.gain.setTargetAtTime(0, t, 0.5);
      gainR.gain.setTargetAtTime(0, t, 0.5);
      gainS.gain.setTargetAtTime(0, t, 0.5);
      setTimeout(() => { try { oscL.stop(); oscR.stop(); oscS.stop(); } catch(e){} }, 2000);
    },
    setVolume: (v) => { masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.1); }
  };
}

// ── Stars ────────────────────────────────────────────────────────────────────

function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    dur: 3 + Math.random() * 5,
    delay: Math.random() * 5,
    minOp: 0.05 + Math.random() * 0.1,
    maxOp: 0.3 + Math.random() * 0.5,
  }));
  return (
    <div className="starfield">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          "--dur": `${s.dur}s`, "--delay": `${s.delay}s`,
          "--min-op": s.minOp, "--max-op": s.maxOp,
        }} />
      ))}
    </div>
  );
}

// ── Animated bars ────────────────────────────────────────────────────────────

function PlayingBars({ color }) {
  return (
    <div className="bars-wrap">
      {[14, 20, 10, 18, 8, 16, 12].map((h, i) => (
        <div key={i} className="bar" style={{
          "--spd": `${0.6 + i * 0.1}s`,
          "--d": `${i * 0.08}s`,
          "--h": `${h}px`,
          background: color,
        }} />
      ))}
    </div>
  );
}

// ── Waveform canvas ──────────────────────────────────────────────────────────

function WaveformCanvas({ playing, mode, kp }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const m = MODES[mode];

    const draw = () => {
      const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.clearRect(0, 0, W, H);

      const cx = H / 2;
      const amp = playing ? cx * 0.65 : cx * 0.2;

      // Schumann influence
      const schumannMod = (kp / 9) * 0.3;

      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const t = x / W;
        const wave1 = Math.sin(t * Math.PI * 6 + phaseRef.current) * amp;
        const wave2 = Math.sin(t * Math.PI * 12 + phaseRef.current * 1.5) * amp * 0.3;
        const wave3 = Math.sin(t * Math.PI * 3 + phaseRef.current * 0.7 + schumannMod) * amp * 0.15;
        const y = cx + wave1 + wave2 + wave3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, m.color + "cc");
      grad.addColorStop(0.7, m.color + "cc");
      grad.addColorStop(1, "transparent");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 * window.devicePixelRatio;
      ctx.stroke();

      // Glow duplicate
      ctx.filter = `blur(${3 * window.devicePixelRatio}px)`;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.filter = "none";
      ctx.globalAlpha = 1;

      if (playing) phaseRef.current += 0.04;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing, mode, kp]);

  return <canvas ref={canvasRef} className="waveform" />;
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function TerraTone() {
  const library = useRef(generateLibrary()).current;
  const [mode, setMode] = useState("sleep");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [activeTrack, setActiveTrack] = useState(library[0]);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const liveKp = 1.5; // Simulated current Kp
  const liveSchumann = parseFloat((7.83 + (liveKp / 9) * 1.0 - 0.5).toFixed(3));

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  const stopAudio = useCallback(() => {
    if (audioNodesRef.current) {
      audioNodesRef.current.stop();
      audioNodesRef.current = null;
    }
    clearInterval(timerRef.current);
    setPlaying(false);
    setProgress(0);
    setElapsed(0);
  }, []);

  const startAudio = useCallback((track, modeKey) => {
    stopAudio();
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      audioNodesRef.current = buildAudio(audioCtxRef.current, modeKey, track.kp);
      audioNodesRef.current.setVolume(volume);
      setPlaying(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(secs);
        setProgress((secs % 3600) / 3600 * 100);
      }, 1000);
    } catch (e) {
      showToast("Audio requires user interaction — tap play again");
    }
  }, [stopAudio, volume]);

  const togglePlay = () => {
    if (playing) stopAudio();
    else startAudio(activeTrack, mode);
  };

  const handleModeChange = (m) => {
    setMode(m);
    if (playing) {
      stopAudio();
      setTimeout(() => startAudio(activeTrack, m), 100);
    }
  };

  const handleTrackSelect = (track) => {
    setActiveTrack(track);
    setMode(track.mode);
    startAudio(track, track.mode);
  };

  useEffect(() => {
    if (audioNodesRef.current) audioNodesRef.current.setVolume(volume);
  }, [volume]);

  useEffect(() => () => stopAudio(), []);

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Stars />
        <div className="orb-container"><div className="orb" /></div>

        <div className="content">
          {/* Header */}
          <header className="header">
            <div className="logo-block">
              <div className="logo-eyebrow">Earth Frequency Audio</div>
              <div className="logo-name">TERRATONE</div>
              <div className="logo-sub">tuned to the living planet</div>
            </div>
            <div className="header-right">
              <div className="schumann-badge">
                <div className="schumann-dot" />
                <span className="schumann-label">Schumann</span>
                <span className="schumann-value">{liveSchumann} Hz</span>
              </div>
              <div className="premium-badge" onClick={() => showToast("Premium coming soon — join the waitlist!")}>
                ◈ UPGRADE TO LIVE
              </div>
            </div>
          </header>

          {/* Waveform */}
          <div className="visualizer-wrap">
            <div className="visualizer-label">Live Earth Resonance · Kp {liveKp} · {getKpLabel(liveKp)}</div>
            <WaveformCanvas playing={playing} mode={mode} kp={activeTrack.kp} />
          </div>

          {/* Mode selector */}
          <div className="mode-row">
            {Object.entries(MODES).map(([key, m]) => (
              <button
                key={key}
                className={`mode-btn ${key} ${mode === key ? "active" : ""}`}
                onClick={() => handleModeChange(key)}
              >
                <span className="mode-icon">{m.icon}</span>
                <div className="mode-name">{m.label}</div>
                <div className="mode-hz">{m.hz}</div>
              </button>
            ))}
          </div>

          {/* Now Playing */}
          <div className="now-playing">
            <div className="np-top">
              <div>
                <div className="np-title">{activeTrack.label} · {MODES[mode].label}</div>
                <div className="np-meta">
                  Schumann {activeTrack.schumann} Hz &nbsp;·&nbsp; Binaural {MODES[mode].binaural} Hz delta &nbsp;·&nbsp; {activeTrack.kpLabel}
                </div>
              </div>
              <div className="np-kp">
                <div className="np-kp-label">Kp Index</div>
                <div className="np-kp-value">{activeTrack.kp}</div>
                <div className="np-kp-desc">{activeTrack.kpLabel}</div>
              </div>
            </div>

            <div className="progress-wrap">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-times">
                <span>{fmtTime(elapsed)}</span>
                <span>∞ continuous</span>
              </div>
            </div>

            <div className="controls">
              <button className="ctrl-btn" onClick={() => {
                const idx = library.findIndex(t => t.id === activeTrack.id);
                if (idx < library.length - 1) handleTrackSelect(library[idx + 1]);
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <button className={`play-btn ${playing ? "playing" : ""}`} onClick={togglePlay}>
                {playing
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{marginLeft:2}}><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              <button className="ctrl-btn" onClick={() => {
                const idx = library.findIndex(t => t.id === activeTrack.id);
                if (idx > 0) handleTrackSelect(library[idx - 1]);
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>

              {playing && <PlayingBars color={MODES[mode].color} />}

              <div className="volume-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#7a8fa8">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input type="range" className="volume-slider" min="0" max="1" step="0.01"
                  value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Premium Live Banner */}
          <div className="live-banner" onClick={() => showToast("Premium coming soon — join the waitlist!")}>
            <div className="live-orb">🌍</div>
            <div className="live-text">
              <div className="live-title">Live Earth Stream</div>
              <div className="live-desc">Uninterrupted real-time audio driven by live NOAA data. Every second is unique. Never repeats.</div>
            </div>
            <div className="live-cta">UNLOCK LIVE</div>
          </div>

          {/* Library */}
          <div className="section-header">
            <div className="section-title">Weekly Library</div>
            <div className="section-count">{library.length} sessions · auto-renews every 3 hrs</div>
          </div>

          <div className="delete-notice">
            <div className="delete-dot" />
            Sessions older than 7 days are removed automatically — each recording is a unique moment in Earth's frequency
          </div>

          <div className="library">
            {library.map(track => (
              <div
                key={track.id}
                className={`lib-item ${activeTrack.id === track.id ? "active" : ""}`}
                onClick={() => handleTrackSelect(track)}
              >
                <div className={`lib-mode-dot ${track.mode}`} />
                <div className="lib-info">
                  <div className="lib-title">{track.label}</div>
                  <div className="lib-mode-tag">{MODES[track.mode].label}</div>
                  <div className="lib-meta">
                    <span>Schumann {track.schumann} Hz</span>
                    <span>Kp {track.kp} · {track.kpLabel}</span>
                    <span>{track.daysLeft}d left</span>
                  </div>
                </div>
                <div className="lib-play-icon">
                  {activeTrack.id === track.id && playing ? "◼" : "▶"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toast */}
        <div className={`toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
      </div>
    </>
  );
}
