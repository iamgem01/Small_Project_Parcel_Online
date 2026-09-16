import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { playShakeSound, playPopOpenSound } from '../utils/soundEffects';

interface ParachuteDropSceneProps {
  recipient: string;
  sender: string;
  onOpenCard: () => void;
}

export const ParachuteDropScene: React.FC<ParachuteDropSceneProps> = ({
  recipient,
  sender,
  onOpenCard,
}) => {
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isOpening, setIsOpening] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLanded(true);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  const handleBoxClick = () => {
    if (!hasLanded || isShaking || isOpening) return;

    setIsShaking(true);
    playShakeSound();

    setTimeout(() => {
      playShakeSound();
    }, 450);

    setTimeout(() => {
      setIsShaking(false);
      setIsOpening(true);
      playPopOpenSound();

      try {
        confetti({
          particleCount: 80,
          spread: 85,
          origin: { y: 0.65 },
          colors: ['#38bdf8', '#60a5fa', '#93c5fd', '#bae6fd', '#fef08a', '#ffffff'],
          shapes: ['star', 'circle'],
          scalar: 1.2,
        });

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0.2, y: 0.7 },
            colors: ['#60a5fa', '#38bdf8', '#bae6fd', '#e0f2fe'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 0.8, y: 0.7 },
            colors: ['#60a5fa', '#38bdf8', '#bae6fd', '#e0f2fe'],
          });
        }, 250);
      } catch (e) {
        console.warn('Confetti error', e);
      }

      setTimeout(() => {
        onOpenCard();
      }, 950);
    }, 1200);
  };

  return (
    <div
      id="drop-scene-container"
      className="relative w-full max-w-md mx-auto h-[820px] max-h-[92vh] rounded-xl overflow-hidden border-4 border-slate-900 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between select-none"
      style={{
        background: 'linear-gradient(180deg, #e0f2fe 0%, #dbeafe 30%, #f0fdf4 70%, #dcfce7 100%)',
      }}
    >
      {/* Blue Watercolor & Indie Pixel Stars in Sky */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-8 text-sky-500 font-pixel text-xl opacity-90 animate-pulse">★</div>
        <div className="absolute top-36 left-12 text-blue-400 font-pixel text-lg opacity-80">★</div>
        <div className="absolute top-18 right-14 text-blue-600 font-pixel text-2xl opacity-90">★</div>
        <div className="absolute top-44 right-8 text-sky-400 font-pixel text-sm opacity-80">★</div>
        <div className="absolute bottom-60 left-24 text-blue-400 font-pixel text-base opacity-80">★</div>
        <div className="absolute bottom-52 right-18 text-sky-500 font-pixel text-lg opacity-85">★</div>
        <div className="absolute bottom-16 right-10 text-blue-500 font-pixel text-xl opacity-90 animate-pulse">★</div>
      </div>

      {/* Hills with Blue & Mint Candy Striping */}
      <div className="absolute inset-x-0 bottom-0 h-[460px] pointer-events-none z-0 overflow-hidden">
        {/* Distant Hills */}
        <div
          className="absolute -bottom-10 -left-10 w-[120%] h-64 rounded-[45%] bg-candy-stripes opacity-75 border-t-2 border-sky-300/40 transform -rotate-3"
        />
        <div
          className="absolute -bottom-14 -right-10 w-[120%] h-64 rounded-[45%] bg-candy-stripes-reverse opacity-70 border-t-2 border-emerald-300/40 transform rotate-4"
        />

        {/* Foreground Tiered Terraced Hills */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-candy-stripes rounded-t-xl  shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/30 to-transparent" />
        </div>
      </div>

      {/* Upper Indie Pixel Label "FOR YOU" in English */}
      <div className="relative z-10 pt-5 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white px-4 py-1.5 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] font-pixel text-[11px] text-blue-400 tracking-wider uppercase"
        >
          ★ FOR YOU ★
        </motion.div>
      </div>

      {/* Parachute + 3D Parcel Box Entity */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          id="parachute-box-entity"
          initial={{ y: -540, rotate: 0 }}
          animate={
            isOpening
              ? { scale: 1.25, opacity: 0, y: -30 }
              : isShaking
              ? {
                  x: [-6, 6, -8, 8, -6, 6, 0],
                  rotate: [-4, 4, -5, 5, -3, 3, 0],
                  y: [0, -4, 0, -5, 0, -3, 0],
                }
              : hasLanded
              ? {
                  y: [0, -4, 0],
                  rotate: 0,
                  transition: {
                    y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
                  },
                }
              : {
                  y: 0,
                  rotate: [-3, 3, -2, 2, 0],
                  transition: {
                    y: { duration: 2.5, ease: [0.22, 1, 0.36, 1] },
                    rotate: { duration: 2.5, ease: 'easeInOut' },
                  },
                }
          }
          transition={
            isShaking
              ? { duration: 0.9, ease: 'easeInOut' }
              : undefined
          }
          onClick={handleBoxClick}
          className={`cursor-pointer group relative flex flex-col items-center select-none w-full max-w-[320px] px-2 ${
            hasLanded ? 'hover:scale-105 active:scale-95 transition-transform duration-200' : ''
          }`}
        >
          {/* Unified Symmetrical Parachute & 3D Parcel SVG (ViewBox 0 0 280 340, Center X = 140) */}
          <div className="relative w-full max-w-[280px] aspect-[280/340] filter drop-shadow-xl">
            <svg viewBox="0 0 280 340" className="w-full h-full overflow-visible">
              <defs>
                {/* Warm Honey Kraft Cardboard Box Gradients */}
                <linearGradient id="boxTopFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f3e0cb" />
                  <stop offset="100%" stopColor="#e2c5a2" />
                </linearGradient>
                <linearGradient id="boxFrontFace" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dfb288" />
                  <stop offset="100%" stopColor="#cd9b69" />
                </linearGradient>
                <linearGradient id="boxSideFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ba8555" />
                  <stop offset="100%" stopColor="#a36e3e" />
                </linearGradient>

                {/* Signature Airmail Blue Packing Tape Gradients */}
                <linearGradient id="blueTapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="blueTapeSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>

                {/* Secret Airmail Candy Stripe Pattern (Matches PasscodeModal & GoodiesBoxView) */}
                <pattern id="airmailCandyStripe" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect x="0" y="0" width="4" height="16" fill="#3b82f6" />
                  <rect x="4" y="0" width="4" height="16" fill="#ffffff" />
                  <rect x="8" y="0" width="4" height="16" fill="#b9d5ee" />
                  <rect x="12" y="0" width="4" height="16" fill="#ffffff" />
                </pattern>

                <filter id="groundShadowBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>

              {/* 1. SOFT LANDING GROUND SHADOW (centered at X = 140, Y = 320) */}
              <ellipse
                cx="140"
                cy="320"
                rx={hasLanded ? "85" : "45"}
                ry={hasLanded ? "14" : "7"}
                fill="#0f172a"
                opacity={hasLanded ? 0.35 : 0.08}
                filter="url(#groundShadowBlur)"
                className="transition-all duration-700"
              />

              {/* 2. PARACHUTE CANOPY (Symmetrical, Center X = 140) */}
              <g id="parachute-canopy" className="filter drop-shadow-sm">
                {/* Panel 1 (Leftmost sky-blue) */}
                <path
                  d="M 140 18 Q 75 35 22 84 Q 38 80 54 87 Q 95 45 140 18 Z"
                  fill="#93c5fd"
                  stroke="#60a5fa"
                  strokeWidth="1.2"
                />
                {/* Panel 2 (White stripe) */}
                <path
                  d="M 140 18 Q 95 45 54 87 Q 71 82 88 89 Q 112 50 140 18 Z"
                  fill="#ffffff"
                  stroke="#60a5fa"
                  strokeWidth="1.2"
                />
                {/* Panel 3 (Royal blue) */}
                <path
                  d="M 140 18 Q 112 50 88 89 Q 105 84 122 90 Q 128 52 140 18 Z"
                  fill="#3b82f6"
                  stroke="#1d4ed8"
                  strokeWidth="1.2"
                />
                {/* Panel 4 (Center white stripe) */}
                <path
                  d="M 140 18 Q 128 52 122 90 Q 140 85 158 90 Q 152 52 140 18 Z"
                  fill="#f8fafc"
                  stroke="#60a5fa"
                  strokeWidth="1.2"
                />
                {/* Panel 5 (Royal blue) */}
                <path
                  d="M 140 18 Q 152 52 158 90 Q 175 84 192 89 Q 168 50 140 18 Z"
                  fill="#3b82f6"
                  stroke="#1d4ed8"
                  strokeWidth="1.2"
                />
                {/* Panel 6 (White stripe) */}
                <path
                  d="M 140 18 Q 168 50 192 89 Q 209 82 226 87 Q 185 45 140 18 Z"
                  fill="#ffffff"
                  stroke="#60a5fa"
                  strokeWidth="1.2"
                />
                {/* Panel 7 (Rightmost sky-blue) */}
                <path
                  d="M 140 18 Q 185 45 226 87 Q 242 80 258 84 Q 205 35 140 18 Z"
                  fill="#93c5fd"
                  stroke="#60a5fa"
                  strokeWidth="1.2"
                />

                {/* Scalloped lower trim border */}
                <path
                  d="M 22 84 Q 38 79 54 87 Q 71 81 88 89 Q 105 83 122 90 Q 140 84 158 90 Q 175 83 192 89 Q 209 81 226 87 Q 242 79 258 84"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Parachute apex top vent cap */}
                <ellipse cx="140" cy="18" rx="8" ry="4" fill="#1d4ed8" stroke="#172554" strokeWidth="1" />
                <circle cx="140" cy="18" r="2.5" fill="#facc15" />
              </g>

              {/* 3. SUSPENSION CORDS (Symmetrically anchored to scallops and converging to (140, 142)) */}
              <g id="suspension-lines" opacity="0.85">
                <line x1="22" y1="84" x2="140" y2="142" stroke="#64748b" strokeWidth="1" strokeDasharray="3,1.5" />
                <line x1="54" y1="87" x2="140" y2="142" stroke="#64748b" strokeWidth="1" strokeDasharray="3,1.5" />
                <line x1="88" y1="89" x2="140" y2="142" stroke="#64748b" strokeWidth="1.1" />
                <line x1="122" y1="90" x2="140" y2="142" stroke="#475569" strokeWidth="1.2" />
                <line x1="140" y1="88" x2="140" y2="142" stroke="#334155" strokeWidth="1.4" />
                <line x1="158" y1="90" x2="140" y2="142" stroke="#475569" strokeWidth="1.2" />
                <line x1="192" y1="89" x2="140" y2="142" stroke="#64748b" strokeWidth="1.1" />
                <line x1="226" y1="87" x2="140" y2="142" stroke="#64748b" strokeWidth="1" strokeDasharray="3,1.5" />
                <line x1="258" y1="84" x2="140" y2="142" stroke="#64748b" strokeWidth="1" strokeDasharray="3,1.5" />
              </g>

              {/* 4. CENTRAL VINTAGE BRASS HARNESS RING & BACK RIGGING */}
              <g id="harness-ring-back">
                {/* Back riser twine: ring → back top corner (140, 168) behind box */}
                <line x1="140" y1="142" x2="140" y2="168" stroke="#6d4722" strokeWidth="2" strokeLinecap="round" />
                <circle cx="140" cy="168" r="3" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                {/* Left riser twine: ring → left top corner (52, 202) */}
                <line x1="140" y1="142" x2="52" y2="202" stroke="#7c532b" strokeWidth="2.2" strokeLinecap="round" />
                {/* Right riser twine: ring → right top corner (228, 202) */}
                <line x1="140" y1="142" x2="228" y2="202" stroke="#7c532b" strokeWidth="2.2" strokeLinecap="round" />
                {/* Antique Brass Ring */}
                <circle cx="140" cy="142" r="5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
                <circle cx="140" cy="142" r="2.5" fill="#fde68a" stroke="#b45309" strokeWidth="0.8" />
              </g>

              {/* 5. 3D ISOMETRIC VINTAGE AIRMAIL PARCEL (Centered at X = 140) */}
              <g id="parcel-box">
                {/* TOP FACE: (140, 168) -> (228, 202) -> (140, 236) -> (52, 202) */}
                <polygon
                  points="140,168 228,202 140,236 52,202"
                  fill="url(#boxTopFace)"
                  stroke="#7c4a1e"
                  strokeWidth="1.3"
                />

                {/* Blue tape strip across top face (perfectly aligned with 3D isometric axis towards right face) */}
                <polygon
                  points="88,188.1 176,222.1 192,215.9 104,181.9"
                  fill="url(#blueTapeGrad)"
                  opacity="0.95"
                />
                <line
                  x1="96"
                  y1="185"
                  x2="184"
                  y2="219"
                  stroke="#bae6fd"
                  strokeWidth="1"
                  strokeDasharray="3,2"
                />

                {/* FRONT-LEFT FACE: (52, 202) -> (140, 236) -> (140, 308) -> (52, 274) */}
                <polygon
                  points="52,202 140,236 140,308 52,274"
                  fill="url(#boxFrontFace)"
                  stroke="#7c4a1e"
                  strokeWidth="1.3"
                />

                {/* Vintage Circular Postmark Stamp (Dấu nhật ấn bưu điện Par Avion) */}
                <g transform="translate(56, 212) skewY(21) scale(0.7)">
                  <circle cx="15" cy="15" r="13" fill="none" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="3,1.5" opacity="0.6" />
                  <circle cx="15" cy="15" r="10" fill="none" stroke="#1e3a8a" strokeWidth="0.6" opacity="0.6" />
                  <text x="15" y="12" textAnchor="middle" fill="#1e3a8a" fontSize="4.5" fontWeight="bold" fontFamily="monospace" opacity="0.75">PAR AVION</text>
                  <text x="15" y="18" textAnchor="middle" fill="#1e3a8a" fontSize="5" fontWeight="bold" fontFamily="monospace" opacity="0.75">SEP 29</text>
                  <text x="15" y="23" textAnchor="middle" fill="#1e3a8a" fontSize="3.5" fontFamily="monospace" opacity="0.6">AIRMAIL</text>
                  {/* Wavy cancellation postal lines */}
                  <path d="M 29 11 Q 34 9 39 11 T 49 11 M 29 15 Q 34 13 39 15 T 49 15 M 29 19 Q 34 17 39 19 T 49 19" fill="none" stroke="#1e3a8a" strokeWidth="0.8" opacity="0.55" />
                </g>

                {/* Blue Star Postage Stamp (Con tem bưu chính Blue Star) */}
                <g transform="translate(62, 244) skewY(21) scale(0.72)">
                  <rect x="0" y="0" width="24" height="28" rx="1" fill="#eff6ff" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,1" />
                  <rect x="2" y="2" width="20" height="24" fill="#dbeafe" />
                  <text x="12" y="16" textAnchor="middle" fill="#2563eb" fontSize="13" fontWeight="bold">★</text>
                  <text x="12" y="23" textAnchor="middle" fill="#1e3a8a" fontSize="4" fontFamily="monospace" fontWeight="bold">AIR 29¢</text>
                </g>

                {/* Secret Airmail Delivery Slip on Left Face */}
                <g transform="translate(90, 232) skewY(21) scale(0.82)">
                  {/* Card base with soft drop shadow */}
                  <rect x="0" y="0" width="50" height="60" rx="2" fill="#fffdfa" stroke="#cbd5e1" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />
                  
                  {/* Airmail candy stripe top border */}
                  <rect x="1" y="1" width="48" height="4.5" fill="url(#airmailCandyStripe)" />
                  <line x1="1" y1="5.5" x2="49" y2="5.5" stroke="#0f172a" strokeWidth="0.6" />

                  {/* Header */}
                  <text x="4" y="12" fill="#1e3a8a" fontSize="4.5" fontFamily="monospace" fontWeight="bold">★ SECRET AIRMAIL</text>
                  
                  {/* TO Recipient */}
                  <text x="4" y="20" fill="#64748b" fontSize="4.5" fontFamily="monospace" fontWeight="bold">TO:</text>
                  <text x="4" y="28" fill="#0f172a" fontSize="7" fontFamily="Courier Prime, monospace" fontWeight="bold">{recipient}</text>
                  
                  {/* FROM Sender */}
                  <line x1="4" y1="32" x2="46" y2="32" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2,1" />
                  <text x="4" y="39" fill="#64748b" fontSize="4.5" fontFamily="monospace" fontWeight="bold">FROM:</text>
                  <text x="4" y="48" fill="#2563eb" fontSize="7.5" fontFamily="Caveat, cursive" fontWeight="bold">{sender}</text>
                  
                  {/* Care footer */}
                </g>

                {/* FRONT-RIGHT FACE: (140, 236) -> (228, 202) -> (228, 274) -> (140, 308) */}
                <polygon
                  points="140,236 228,202 228,274 140,308"
                  fill="url(#boxSideFace)"
                  stroke="#6c3f15"
                  strokeWidth="1.3"
                />

                {/* Blue tape strip running down front-right face (seamlessly continuing from top face tape) */}
                <polygon
                  points="176,222.1 192,215.9 192,287.9 176,294.1"
                  fill="url(#blueTapeSideGrad)"
                  opacity="0.95"
                />
                <line
                  x1="184"
                  y1="219"
                  x2="184"
                  y2="291"
                  stroke="#93c5fd"
                  strokeWidth="1"
                  strokeDasharray="3,2"
                />

                {/* Barcode & Airmail Postage Mark on Right Face */}
                <g transform="translate(156, 234) skewY(-21) scale(0.85)">
                  <rect x="0" y="0" width="48" height="26" rx="1.5" fill="#fffdfa" opacity="0.95" stroke="#cbd5e1" strokeWidth="0.8" />
                  {/* Airmail candy stripe mini accent on barcode */}
                  <rect x="1" y="1" width="46" height="2.5" fill="url(#airmailCandyStripe)" />
                  {[3, 6, 9, 12, 16, 20, 24, 27, 31, 35, 39, 43].map((bx, bi) => (
                    <line key={bi} x1={bx} y1="5" x2={bx} y2="18" stroke="#1e293b" strokeWidth={bi % 2 === 0 ? "1.4" : "0.9"} />
                  ))}
                  <text x="4" y="23" fill="#1e3a8a" fontSize="4" fontFamily="monospace" fontWeight="bold">AIR-2026-0929</text>
                </g>

                {/* Highlight creases for 3D depth */}
                <line x1="52" y1="202" x2="140" y2="236" stroke="#fff1e0" strokeWidth="0.9" opacity="0.6" />
              </g>

              {/* 6. VINTAGE JUTE TWINE & ANTIQUE BRASS EYELETS (Rigging & Edge Cradles) */}
              <g id="front-harness-rigging">
                {/* Front riser twine: ring (140, 142) → front top corner (140, 236) in front of top face */}
                <line x1="140" y1="142" x2="140" y2="236" stroke="#6d4520" strokeWidth="2.2" strokeLinecap="round" />

                {/* Left corner vertical twine cord (52, 202) → (52, 274) */}
                <line x1="52" y1="202" x2="52" y2="274" stroke="#7c532b" strokeWidth="2.2" strokeLinecap="round" />
                {/* Right corner vertical twine cord (228, 202) → (228, 274) */}
                <line x1="228" y1="202" x2="228" y2="274" stroke="#5c3818" strokeWidth="2.2" strokeLinecap="round" />
                {/* Front corner vertical twine cord (140, 236) → (140, 308) */}
                <line x1="140" y1="236" x2="140" y2="308" stroke="#6d4520" strokeWidth="2.2" strokeLinecap="round" />

                {/* Bottom cradle twine cords (under parcel base) */}
                <line x1="52" y1="274" x2="140" y2="308" stroke="#5c3818" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="140" y1="308" x2="228" y2="274" stroke="#5c3818" strokeWidth="2.4" strokeLinecap="round" />

                {/* Antique Brass D-Ring Eyelets at top 3 visible corners */}
                <circle cx="52" cy="202" r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                <circle cx="52" cy="202" r="1.5" fill="#fef08a" />

                <circle cx="228" cy="202" r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                <circle cx="228" cy="202" r="1.5" fill="#fef08a" />

                <circle cx="140" cy="236" r="3.5" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                <circle cx="140" cy="236" r="1.5" fill="#fef08a" />

                {/* Antique Brass Corner Reinforcement Fittings at bottom 3 corners */}
                <circle cx="52" cy="274" r="3" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
                <circle cx="52" cy="274" r="1.2" fill="#fef08a" />

                <circle cx="228" cy="274" r="3" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                <circle cx="228" cy="274" r="1.2" fill="#fef08a" />

                <circle cx="140" cy="308" r="3.5" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
                <circle cx="140" cy="308" r="1.5" fill="#fef08a" />
              </g>
            </svg>
          </div>

          {/* Indie Pixel "TAP TO OPEN" Button in English with reserved height to avoid layout shift */}
          <div className="h-16 flex items-center justify-center mt-2">
            <AnimatePresence>
              {hasLanded && !isOpening && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="bg-white px-5 py-2 border-3 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] font-pixel text-xs text-slate-900 tracking-wider uppercase hover:bg-sky-100 transition cursor-pointer flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5">
                    <span className="w-2 h-2 bg-sky-500 animate-ping inline-block" />
                    <span>[ TAP TO OPEN ]</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Footer in English */}
      <div className="relative z-10 pb-4 text-center">
        <p className="text-[10px] text-slate-600 font-pixel tracking-widest opacity-90">
         • DELIVERING HAPPINESS •
        </p>
      </div>
    </div>
  );
};
