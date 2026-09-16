import React, { useState } from 'react';
import { CardConfig, PhotoItem, VoiceNoteData } from '../types';
import { YouTubePlayer } from './YouTubePlayer';
import { SpotifyPlayer } from './SpotifyPlayer';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { PhotoGallery } from './PhotoGallery';
import { BlueStarBouquet } from './BlueStarBouquet';
import { GoodiesBoxView } from './GoodiesBoxView';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface VintageNoteCardProps {
  config: CardConfig;
  currentSongIndex: number;
  isPlayingMusic: boolean;
  onPlaySong: (index: number) => void;
  onTogglePlayMusic: () => void;
  onPauseMusic?: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onAddPhoto: (photo: PhotoItem) => void;
  onRemovePhoto?: (id: string) => void;
  onUpdateVoiceNote: (voice: VoiceNoteData) => void;
  onOpenCustomizer: () => void;
  onResetToLock: () => void;
  onRedeemCoupon?: () => void;
  onUpdateFlowerPhoto?: (url: string) => void;
  readOnly?: boolean;
  onOpenShare?: () => void;
}

export const VintageNoteCard: React.FC<VintageNoteCardProps> = ({
  config,
  currentSongIndex,
  isPlayingMusic,
  onPlaySong,
  onTogglePlayMusic,
  onPauseMusic,
  onNextSong,
  onPrevSong,
  onAddPhoto,
  onRemovePhoto,
  onUpdateVoiceNote,
  onOpenCustomizer,
  onResetToLock,
  onRedeemCoupon,
  onUpdateFlowerPhoto,
  readOnly = false,
  onOpenShare,
}) => {
  const [activeTab, setActiveTab] = useState<'goodies' | 'letter'>('goodies');
  const [couponRedeemed, setCouponRedeemed] = useState<boolean>(
    config.coupon?.isRedeemed || false
  );

  const handleRedeemCoupon = () => {
    setCouponRedeemed(true);
    if (onRedeemCoupon) onRedeemCoupon();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#60a5fa', '#f472b6', '#facc15', '#93c5fd'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full max-w-md mx-auto rounded-sm overflow-hidden border-4 border-slate-900 shadow-[4px_4px_0px_0px_#1e293b] bg-[#faf8f2] my-3 select-none"
    >
      {/* Top Floating Control Bar in English & Indie Pixel Style */}
      <div className="bg-[#1e293b] text-slate-200 px-4 py-2 flex items-center justify-between font-pixel text-[10px] border-b-3 border-slate-950">
        <button
          type="button"
          onClick={onResetToLock}
          className="w-7 h-7 hover:bg-slate-700 text-slate-200 hover:text-sky-300 transition cursor-pointer flex items-center justify-center text-base leading-none border border-slate-600"
          title="Lock parcel and view parachute drop again"
        >
          ←
        </button>

        <span className="font-pixel text-[8px] text-slate-400">
          ★
        </span>
      </div>

      {/* Main View Mode Selector: Box of Goodies vs Postal Letter */}
      <div className="bg-[#e2e8f0] border-b-2 border-slate-900 p-2 flex items-center justify-center gap-2 font-pixel text-[9px]">
        <button
          type="button"
          onClick={() => setActiveTab('goodies')}
          className={`px-3 py-1.5 border-2 border-slate-900 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'goodies'
              ? 'bg-blue-600 text-white font-bold shadow-[2px_2px_0px_0px_#0f172a]'
              : 'bg-white text-slate-700 shadow-[1px_1px_0px_0px_#0f172a] hover:bg-sky-50'
          }`}
        >
          <span className="font-pixel text-[8px]">★</span>
          <span>BOX OF GOODIES</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('letter')}
          className={`px-3 py-1.5 border-2 border-slate-900 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'letter'
              ? 'bg-blue-600 text-white font-bold shadow-[2px_2px_0px_0px_#0f172a]'
              : 'bg-white text-slate-700 shadow-[1px_1px_0px_0px_#0f172a] hover:bg-sky-50'
          }`}
        >
          <span className="font-pixel text-[8px]">✦</span>
          <span>POSTAL LETTER</span>
        </button>
      </div>

      {/* VIEW 1: A Little Box of Goodies (Inspired by boxofgoodies.littleweb.world) */}
      {activeTab === 'goodies' ? (
        <div className="p-3 sm:p-5 bg-[#faf7f0]">
          <GoodiesBoxView
            config={config}
            currentSongIndex={currentSongIndex}
            isPlayingMusic={isPlayingMusic}
            onPlaySong={onPlaySong}
            onTogglePlayMusic={onTogglePlayMusic}
            onPauseMusic={onPauseMusic}
            onNextSong={onNextSong}
            onPrevSong={onPrevSong}
            onAddPhoto={onAddPhoto}
            onRemovePhoto={onRemovePhoto}
            onUpdateVoiceNote={onUpdateVoiceNote}
            onRedeemCoupon={handleRedeemCoupon}
            onSwitchToLetterView={() => setActiveTab('letter')}
            onUpdateFlowerPhoto={onUpdateFlowerPhoto}
            readOnly={readOnly}
          />
        </div>
      ) : (
        /* VIEW 2: Full Vintage Lined Postal Letter */
        <div className="bg-notebook-paper text-stone-800 pb-12 pt-0 relative overflow-hidden">
          {/* 1. Dusty Blue Header Banner in English */}
          <div className="bg-[#b9d5ee] px-6 py-4 text-center border-b-2 border-slate-900 shadow-xs">
            <h2 className="font-pixel text-base sm:text-lg font-black tracking-widest text-[#1e3a8a] uppercase">
              {config.title}
            </h2>
          </div>
          {/* 2. Delivery Slip / Postage Receipt in English */}
          <div className="p-6 pb-4 border-b-2 border-dashed border-slate-400 relative">
            {/* Blue Ink Postage Stamp */}
            <div className="absolute top-4 right-5 rotate-[-3deg] border-2 border-slate-900 bg-sky-100 px-2.5 py-1.5 shadow-[2px_2px_0px_0px_#0f172a] pointer-events-none">
              <span className="block font-pixel text-[8px] text-sky-950 uppercase tracking-tight text-center leading-tight">
                {config.stampText}
              </span>
            </div>

            {/* TO Section */}
            <div className="mb-3 px-2 sm:px-4">
              <span className="font-pixel text-[10px] font-black tracking-wider text-slate-600 block">
                TO:
              </span>
              <span className="font-handwriting text-2xl text-slate-900 font-bold italic block pl-1">
                {config.recipient}
              </span>
            </div>

            {/* FROM Section */}
            <div className="mb-3 px-2 sm:px-4">
              <span className="font-pixel text-[10px] font-black tracking-wider text-slate-600 block">
                FROM:
              </span>
              <span className="font-handwriting text-xl text-slate-700 italic block pl-1">
                {config.sender}
              </span>
            </div>

            {/* Barcode & Tracking Code */}
            <div className="px-2 sm:px-4 mt-3 pt-2 flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-0.5 h-9 tracking-tighter opacity-90 select-none">
                {[3, 1, 2, 4, 1, 2, 3, 1, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2].map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-900 h-full inline-block"
                    style={{ width: `${w * 1.6}px`, marginRight: `${(idx % 3) * 1.5}px` }}
                  />
                ))}
              </div>
              <span className="font-pixel text-[9px] text-slate-600 tracking-widest mt-1">
                {config.trackingCode}
              </span>
            </div>
          </div>
          
          {/* 5. Sub-header in English */}
          <div className="px-4 sm:px-6 pb-2 text-center sm:text-left">
            <div className="pt-3">
              <h3 className="font-pixel text-xs font-bold uppercase tracking-wider text-slate-700">
                {config.title}
              </h3>
              <p className="font-handwriting text-base text-slate-500 italic">
                unboxed with love for {config.recipient}
              </p>
            </div>
          </div>

          {/* 3. Heartfelt Letter — right after TO/FROM/barcode */}
          <div className="px-4 sm:px-6 py-4">
            <div>
              <div className="bg-[#fffefb] p-5 border-3 border-slate-900 shadow-[4px_4px_0px_0px_#1e293b] relative overflow-hidden">
                <div className="absolute top-0 right-8 w-16 h-4 bg-sky-200 border border-slate-900 transform rotate-2 shadow-xs font-pixel text-[7px] text-center text-slate-900 flex items-center justify-center">
                  NOTE
                </div>

                <h4 className="font-handwriting text-xl text-stone-800 font-bold mb-2">
                  {config.letterGreeting}
                </h4>

                <div className="font-handwriting text-lg text-stone-700 leading-relaxed whitespace-pre-line space-y-3">
                  {config.letterBody}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-300 text-right">
                  <span className="font-handwriting text-lg text-sky-900 font-bold block">
                    {config.letterClosing}
                  </span>
                  <span className="font-pixel text-[9px] text-slate-500 block mt-0.5">
                    DATE: {config.deliveryDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Blue Star Bouquet */}
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-center">
                <BlueStarBouquet
                  customPhotoUrl={config.flowerPhotoUrl}
                  showMeaning={true}
                  initialMode="illustration"
                  onUpdateFlowerPhoto={onUpdateFlowerPhoto}
                  readOnly={readOnly}
                  bouquetTitle={config.bouquetTitle}
                  bouquetMeaning={config.bouquetMeaning}
                />
              </div>
            </div>
          </div>

          

          {/* 6. Polaroid Memories in English */}
          <div className="px-4 sm:px-6 py-4">
            <div>
              <div className="inline-block border-2 border-slate-900 bg-white px-3 py-1 shadow-[2px_2px_0px_0px_#0f172a] mb-3">
                <span className="font-pixel text-[10px] font-bold text-slate-900 tracking-wider">
                  [ POLAROID MEMORIES ]
                </span>
              </div>

              <PhotoGallery
                photos={config.photos}
                onAddPhoto={readOnly ? undefined : onAddPhoto}
                onRemovePhoto={readOnly ? undefined : onRemovePhoto}
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* 7. Voice Cassette in English */}
          <div className="px-4 sm:px-6 py-4">
            <div>
              <div className="inline-block border-2 border-slate-900 bg-sky-100 px-3 py-1 shadow-[2px_2px_0px_0px_#0f172a] mb-3">
                <span className="font-pixel text-[10px] font-bold text-sky-950 tracking-wider">
                  [ AUDIO CASSETTE ]
                </span>
              </div>

              <VoiceNotePlayer
                voiceNote={config.voiceNote}
                onUpdateVoiceNote={readOnly ? undefined : onUpdateVoiceNote}
              />
            </div>
          </div>

          {/* 8. Music Section: Spotify & YouTube Mixtape */}
          <div className="px-4 sm:px-6 py-4 space-y-4">
            <div>
              <div className="border-2 border-slate-900 bg-emerald-100 px-3.5 py-1 shadow-[2px_2px_0px_0px_#0f172a] mb-3 inline-block">
                <span className="font-pixel text-xs font-semibold tracking-wider text-emerald-950">
                  [ ★ SPOTIFY SOUNDTRACK ]
                </span>
              </div>

              <SpotifyPlayer
                trackId={config.spotifyTrackId || '1kPpge9JDLpcj15qgrPbYX'}
                spotifyUrl={config.spotifyUrl || 'https://open.spotify.com/track/1kPpge9JDLpcj15qgrPbYX?si=ae31586e710e48bc'}
              />
            </div>

            <div>
              <div className="border-2 border-slate-900 bg-sky-100 px-3.5 py-1 shadow-[2px_2px_0px_0px_#0f172a] mb-3 inline-block">
                <span className="font-pixel text-xs font-semibold tracking-wider text-sky-950">
                  {config.tagline || 'OUR PLAYLIST'}
                </span>
              </div>

              <YouTubePlayer
                playlist={config.playlist}
                currentSongIndex={currentSongIndex}
                isPlaying={isPlayingMusic}
                onPlaySong={onPlaySong}
                onTogglePlay={onTogglePlayMusic}
                onNextSong={onNextSong}
                onPrevSong={onPrevSong}
              />
            </div>
          </div>

          {/* Footer in English */}
          <div className="px-6 pt-6 pb-2 text-center text-slate-500 font-pixel text-[10px]">
            <p>
              Packed with care for {config.recipient} ★
            </p>
            <p className="mt-1 text-[9px] text-slate-400 font-mono">
              CREATED • 2026
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
