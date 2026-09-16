import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playKeypadClick, playSuccessChime } from '../utils/soundEffects';

interface PasscodeModalProps {
  correctPasscode: string;
  hint: string;
  recipient: string;
  sender: string;
  onSuccess: () => void;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  correctPasscode,
  hint,
  recipient,
  sender,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    playKeypadClick();
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      checkCode(nextPin);
    }
  };

  const handleBackspace = () => {
    playKeypadClick();
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const checkCode = (code: string) => {
    if (code.trim() === correctPasscode.trim()) {
      playSuccessChime();
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else if (code.length >= correctPasscode.length) {
      setError(true);
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
  };

  return (
    <div
      id="passcode-container"
      className="w-full flex items-center justify-center p-2 sm:p-4 relative overflow-hidden"
    >
      {/* Decorative stars — dusty blue matching app palette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <span className="absolute top-10 left-12 text-sky-400 font-pixel text-xl animate-pulse">★</span>
        <span className="absolute top-24 right-20 text-blue-400 font-pixel text-lg">★</span>
        <span className="absolute bottom-28 left-1/4 text-sky-300 font-pixel text-2xl">★</span>
        <span className="absolute top-1/2 right-12 text-blue-300 font-pixel text-sm">★</span>
        <span className="absolute bottom-16 right-1/4 text-sky-400 font-pixel text-xl animate-pulse">★</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#fffdfa] border-4 border-slate-900 shadow-[6px_6px_0px_0px_#1e293b] p-6 sm:p-7 relative z-10 font-typewriter"
      >
        {/* Candy stripe banner — same as GoodiesBoxView (red + blue + white) */}
        <div className="h-4 w-full border-2 border-slate-900 mb-5 bg-[repeating-linear-gradient(45deg,#b9d5ee_0,#b9d5ee_10px,#ffffff_10px,#ffffff_20px,#38bdf8_20px,#38bdf8_30px,#ffffff_30px,#ffffff_40px)]" />

        {/* Dusty Blue Header — matches letter view header (#b9d5ee) */}
        <div className="text-center mb-5">
          <div className="bg-[#b9d5ee] border-2 border-slate-900 px-4 py-2 mb-3 shadow-[3px_3px_0px_0px_#0f172a] inline-block">
            <span className="font-pixel text-[9px] text-[#1e3a8a] tracking-widest uppercase block">
              ★ SECRET PARCEL AIRMAIL ★
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase font-pixel">
            OPEN PARCEL
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-typewriter">
            TO: <span className="font-bold text-slate-900">{recipient}</span> • FROM:{' '}
            <span className="italic text-slate-700">{sender}</span>
          </p>
        </div>

        {/* Pixel instruction */}
        <div className="flex flex-col items-center mb-5">
          {/* Pixel rabbit icon */}
          <div className="mb-2 drop-shadow-[2px_2px_0px_rgba(15,23,42,0.5)]">
            <svg width="48" height="48" viewBox="0 0 20 22" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
              {/* Left ear */}
              <rect x="4" y="1" width="3" height="6" fill="#b9d5ee" />
              <rect x="5" y="2" width="1" height="4" fill="#f9a8d4" />
              {/* Right ear */}
              <rect x="13" y="1" width="3" height="6" fill="#b9d5ee" />
              <rect x="14" y="2" width="1" height="4" fill="#f9a8d4" />
              {/* Head */}
              <rect x="3" y="5" width="14" height="9" fill="#dbeafe" />
              {/* Eyes */}
              <rect x="6" y="8" width="2" height="2" fill="#1e3a8a" />
              <rect x="12" y="8" width="2" height="2" fill="#1e3a8a" />
              {/* Eye shine */}
              <rect x="7" y="8" width="1" height="1" fill="#ffffff" />
              <rect x="13" y="8" width="1" height="1" fill="#ffffff" />
              {/* Nose */}
              <rect x="9" y="10" width="2" height="1" fill="#f9a8d4" />
              {/* Mouth */}
              <rect x="8" y="11" width="1" height="1" fill="#93c5fd" />
              <rect x="11" y="11" width="1" height="1" fill="#93c5fd" />
              {/* Body */}
              <rect x="4" y="14" width="12" height="5" fill="#dbeafe" />
              {/* Arms */}
              <rect x="2" y="14" width="2" height="3" fill="#b9d5ee" />
              <rect x="16" y="14" width="2" height="3" fill="#b9d5ee" />
              {/* Feet */}
              <rect x="4" y="18" width="4" height="2" fill="#b9d5ee" />
              <rect x="12" y="18" width="4" height="2" fill="#b9d5ee" />
              {/* Tail */}
              <rect x="15" y="15" width="2" height="2" fill="#ffffff" />
              {/* Belly */}
              <rect x="8" y="15" width="4" height="3" fill="#e0f2fe" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 text-center font-pixel text-[11px] leading-relaxed">
            ENTER SECRET CODE TO OPEN
          </p>
        </div>

        {/* PIN Display slots */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, idx) => {
            const digit = pin[idx];
            return (
              <motion.div
                key={idx}
                animate={error ? { x: [-5, 5, -3, 3, 0] } : {}}
                transition={{ duration: 0.25 }}
                className={`w-12 h-14 border-3 flex items-center justify-center text-2xl font-pixel transition-all duration-100 ${
                  error
                    ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-[3px_3px_0px_0px_#be123c]'
                    : digit
                    ? 'border-slate-900 bg-[#b9d5ee] text-[#1e3a8a] shadow-[3px_3px_0px_0px_#0f172a]'
                    : 'border-dashed border-slate-400 bg-stone-50 text-slate-400'
                }`}
              >
                {digit ? '•' : ''}
              </motion.div>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-rose-600 text-center font-pixel mb-4"
          >
            INCORRECT CODE! TRY AGAIN OR CHECK HINT
          </motion.p>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              id={`keypad-${num}`}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-12 border-2 border-slate-900 bg-[#fffdfa] hover:bg-[#e8f4fd] active:translate-x-0.5 active:translate-y-0.5 text-slate-800 text-lg font-pixel font-bold transition flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]"
            >
              {num}
            </button>
          ))}
          <button
            id="keypad-hint-toggle"
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="h-12 border-2 border-slate-900 bg-[#b9d5ee] hover:bg-[#a8cae8] text-[#1e3a8a] text-xs font-pixel flex items-center justify-center transition shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5"
            title="Show passcode hint"
          >
            [?]
          </button>
          <button
            id="keypad-0"
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 border-2 border-slate-900 bg-[#fffdfa] hover:bg-[#e8f4fd] active:translate-x-0.5 active:translate-y-0.5 text-slate-800 text-lg font-pixel font-bold transition flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]"
          >
            0
          </button>
          <button
            id="keypad-backspace"
            type="button"
            onClick={handleBackspace}
            className="h-12 border-2 border-slate-900 bg-[#fffdfa] hover:bg-rose-50 active:translate-x-0.5 active:translate-y-0.5 text-slate-700 text-[11px] font-pixel flex items-center justify-center transition shadow-[2px_2px_0px_0px_#0f172a]"
          >
            DEL
          </button>
        </div>

        {/* Hint banner */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-[#e8f4fd] border-2 border-slate-900 text-xs text-slate-900 mb-4 overflow-hidden shadow-[3px_3px_0px_0px_#0f172a]"
            >
              <p className="font-pixel text-[10px] text-[#1e3a8a] mb-1">[ HINT ]</p>
              <p className="font-typewriter text-xs text-slate-700">{hint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center pt-3 border-t-2 border-slate-200 flex items-center justify-center font-pixel text-[10px]">
          <span className="text-slate-400 tracking-wider">★ 2026 WITH LOVE ★</span>
        </div>
      </motion.div>
    </div>
  );
};
