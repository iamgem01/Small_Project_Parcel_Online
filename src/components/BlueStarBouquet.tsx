import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface BlueStarBouquetProps {
  customPhotoUrl?: string;
  className?: string;
  showMeaning?: boolean;
  initialMode?: 'illustration' | 'photo';
  onUpdateFlowerPhoto?: (url: string) => void;
  readOnly?: boolean;
  bouquetTitle?: string;
  bouquetMeaning?: string;
}

const CURATED_BLUE_STAR_PHOTOS = [
  {
    title: 'Bouquet in Kraft Wrap',
    url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop',
    tag: 'Web Photo • Floral Kraft',
  },
  {
    title: 'Oxypetalum Coeruleum (Tweedia)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Oxypetalum_coeruleum_flower.jpg/640px-Oxypetalum_coeruleum_flower.jpg',
    tag: 'Botanical • Blue Star Blossom',
  },
  {
    title: 'Dreamy Sky Blossoms',
    url: 'https://images.unsplash.com/photo-1596726696700-1d8f78082987?q=80&w=800&auto=format&fit=crop',
    tag: 'Pastel Blue • Star Petals',
  },
  {
    title: 'Soft Blue Hydrangea Bloom',
    url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800&auto=format&fit=crop',
    tag: 'Sky Blue • Peaceful Petals',
  },
];

export const BlueStarBouquet: React.FC<BlueStarBouquetProps> = ({
  customPhotoUrl,
  className = '',
  showMeaning = true,
  initialMode = 'illustration',
  onUpdateFlowerPhoto,
  readOnly = false,
  bouquetTitle = 'A gentle bouquet of Blue Stars',
  bouquetMeaning = 'Symbolizing everlasting trust, genuine sincerity, and a quiet love as pure as the morning sky.',
}) => {
  const [viewMode, setViewMode] = useState<'illustration' | 'photo'>(
    customPhotoUrl ? 'photo' : initialMode
  );
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [isSparkling, setIsSparkling] = useState<boolean>(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>(customPhotoUrl || '');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPhoto = customPhotoUrl || CURATED_BLUE_STAR_PHOTOS[photoIndex].url;

  const handleSparkleClick = () => {
    setIsSparkling(true);
    setTimeout(() => setIsSparkling(false), 800);
    try {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#60a5fa', '#38bdf8', '#facc15', '#f472b6'],
      });
    } catch {
      // ignore
    }
  };

  const handleFlowerFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTempPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFlowerPhoto) {
      onUpdateFlowerPhoto(tempPhotoUrl.trim());
    }
    setViewMode('photo');
    setIsEditingPhoto(false);
  };

  return (
    <div id="blue-star-bouquet-container" className={`flex flex-col items-center select-none ${className}`}>
      {/* Indie Pixel Container */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative bg-[#fffdfa] border-4 border-slate-900 rounded-sm p-4 shadow-[6px_6px_0px_0px_#1e293b] max-w-[320px] w-full flex flex-col items-center text-center font-typewriter"
      >
        {/* Pixel style washi tape at top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-sky-200 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] z-10 font-pixel text-[8px] text-slate-900 flex items-center justify-center tracking-wider">
          ★ GOODIE ★
        </div>

        {/* Change Photo button — only in edit mode */}
        {!readOnly && (
          <div className="mt-1 mb-2 w-full flex justify-end px-1">
            <button
              type="button"
              onClick={() => {
                setTempPhotoUrl(customPhotoUrl || '');
                setIsEditingPhoto(true);
              }}
              className="font-pixel text-[8px] px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a] transition font-bold cursor-pointer"
              title="Change flower photo with upload or preset"
            >
              [ ✦ CHANGE PHOTO ]
            </button>
          </div>
        )}

        {/* MODE 1: TRANSPARENT ILLUSTRATION CUTOUT */}
        {viewMode === 'illustration' ? (
          <div className="w-full flex flex-col items-center">
            {/* Pure Transparent Cutout Showcase */}
            <motion.div
              onClick={handleSparkleClick}
              title="Click bouquet for magic sparkles!"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative w-full aspect-square max-w-[240px] flex items-center justify-center cursor-pointer p-2 rounded-md my-1 group"
              style={{
                /* Subtle checkerboard indicator when hovering to show it is truly transparent */
                backgroundImage: 'radial-gradient(#e0f2fe 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              {/* Floating Twinkle Star Accents */}
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute top-2 right-3 text-amber-400 font-pixel text-lg pointer-events-none drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]"
              >
                ★
              </motion.span>

              <motion.span
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-6 left-3 text-amber-400 font-pixel text-base pointer-events-none drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]"
              >
                ★
              </motion.span>

              {/* Show custom photo in cutout mode if available, otherwise use SVG */}
              {customPhotoUrl ? (
                <motion.img
                  src={customPhotoUrl}
                  alt="Blue Star Flower Bouquet"
                  referrerPolicy="no-referrer"
                  animate={isSparkling ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : { y: [0, -3, 0] }}
                  transition={isSparkling ? { duration: 0.5 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full object-cover rounded-sm filter drop-shadow-[0_10px_16px_rgba(59,130,246,0.3)] transition-transform duration-300"
                />
              ) : (
                <motion.img
                  src="/blue-star-bouquet-transparent.svg"
                  alt="Blue Star Flower Bouquet Cutout"
                  referrerPolicy="no-referrer"
                  animate={isSparkling ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : { y: [0, -3, 0] }}
                  transition={isSparkling ? { duration: 0.5 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(59,130,246,0.3)] transition-transform duration-300"
                />
              )}

              {/* Cute hover hint */}
              <div className="absolute bottom-1 bg-white/90 border border-slate-900 px-2 py-0.5 rounded-xs font-pixel text-[7px] text-sky-900 shadow-xs opacity-80 group-hover:opacity-100 transition">
                ★ TAP FOR SPARKLES
              </div>
            </motion.div>

            {/* Badge Info */}
            <div className="flex items-center justify-between w-full px-1 mt-1 font-pixel text-[8px] text-slate-500">
              <span className="bg-sky-100 border border-sky-300 px-1.5 py-0.5 text-sky-900">
                100% TRANSPARENT CUTOUT
              </span>
              <span className="text-slate-400">
                PINK RIBBON & STARS
              </span>
            </div>
          </div>
        ) : (
          /* MODE 2: REAL BOTANICAL WEB PHOTOS */
          <div className="w-full flex flex-col items-center">

            <div className="relative w-full aspect-[4/5] rounded-xs border-2 border-slate-900 bg-slate-900 overflow-hidden shadow-[inset_0px_0px_8px_rgba(0,0,0,0.4)]">
              <img
                src={currentPhoto}
                alt="Real Blue Star Flower Bouquet from Web"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
              />
              
            </div>

            {/* Photo switcher */}
            {!customPhotoUrl && (
              <div className="flex items-center justify-between w-full mt-2 px-1 text-[8px] font-pixel text-slate-600">
                <span>PHOTO {photoIndex + 1}/3</span>
                <div className="flex gap-1">
                  {CURATED_BLUE_STAR_PHOTOS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoIndex(idx)}
                      className={`w-4 h-4 border border-slate-900 flex items-center justify-center font-mono text-[9px] ${
                        photoIndex === idx
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white text-slate-700 hover:bg-sky-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Indie RPG Item Stats Box */}
        <div className="w-full mt-2.5 bg-sky-50/90 border-2 border-slate-900 p-2 text-left font-pixel text-[9px] text-slate-800 space-y-1 shadow-[2px_2px_0px_0px_#0f172a]">
          <div className="flex justify-between items-center text-sky-950 font-bold border-b border-sky-200 pb-0.5">
            <span>[ ITEM: BLUE STAR BOUQUET ]</span>
            <span className="text-amber-500">★★★★★</span>
          </div>
          <p className="text-[8px] text-slate-600">
            BOTANICAL: Oxypetalum Caeruleum (Tweedia)
          </p>
          <div className="flex justify-between text-[8px] text-blue-700 font-bold">
            <span>STATUS: BLOOMING</span>
            <span>BUFF: +100 HAPPINESS</span>
          </div>
        </div>

        {/* Meaning & Quotes */}
        {showMeaning && (
          <div className="mt-2.5 pt-2 border-t border-slate-300 w-full text-center">
            <p className="font-handwriting text-xl text-sky-950 font-bold leading-tight">
              "{bouquetTitle}"
            </p>
            <p className="font-typewriter text-[10px] text-slate-600 mt-1 leading-relaxed italic px-1">
              "{bouquetMeaning}"
            </p>
          </div>
        )}
      </motion.div>

      {/* Flower Photo Edit Modal */}
      <AnimatePresence>
        {isEditingPhoto && (
          <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-5 max-w-sm w-full border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] font-typewriter text-left"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-pixel text-[11px] text-sky-950">
                  [ ★ CHANGE FLOWER PHOTO ]
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingPhoto(false)}
                  className="font-pixel text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Upload via Drag & Drop or Click */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFlowerFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-3 mb-3 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-blue-600 bg-sky-100'
                    : 'border-slate-400 bg-stone-50 hover:bg-sky-50 hover:border-slate-800'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFlowerFile(file);
                  }}
                  className="hidden"
                />
                <span className="font-pixel text-base block font-bold text-sky-700">[ + ]</span>
                <span className="font-pixel text-[9px] text-slate-800 block mt-1">
                  CLICK TO SELECT IMAGE OR DRAG & DROP HERE
                </span>
                <span className="text-[8px] text-slate-500 font-mono block">
                  Supports JPG, PNG, WEBP
                </span>
              </div>

              {/* Curated Presets */}
              <div className="mb-3">
                <label className="block text-slate-700 font-semibold mb-1 font-pixel text-[9px]">
                  OR CHOOSE A CURATED FLOWER PRESET:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CURATED_BLUE_STAR_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTempPhotoUrl(preset.url)}
                      className={`relative aspect-square border-2 overflow-hidden group cursor-pointer ${
                        tempPhotoUrl === preset.url
                          ? 'border-blue-600 ring-2 ring-blue-400'
                          : 'border-slate-700 hover:border-slate-900'
                      }`}
                      title={preset.title}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              {tempPhotoUrl && (
                <div className="mb-3 p-2 bg-sky-50 border border-sky-300 flex items-center gap-2">
                  <img
                    src={tempPhotoUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover border border-slate-800"
                  />
                  <div className="text-[9px]">
                    <span className="font-pixel text-emerald-800 font-bold block">✓ FLOWER PHOTO SELECTED</span>
                    <span className="text-slate-500 truncate max-w-[170px] block font-mono">
                      {tempPhotoUrl.slice(0, 30)}...
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveCustomPhoto} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-pixel text-[9px]">
                    OR PASTE IMAGE LINK (URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://... image link"
                    value={tempPhotoUrl}
                    onChange={(e) => setTempPhotoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border-2 border-slate-900 text-xs focus:outline-none focus:bg-sky-50 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingPhoto(false)}
                    className="px-3 py-1.5 border-2 border-slate-900 text-slate-700 hover:bg-slate-100 font-pixel text-[10px] cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 border-2 border-slate-900 bg-sky-600 hover:bg-sky-500 text-white font-pixel text-[10px] shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
                  >
                    SAVE PHOTO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
