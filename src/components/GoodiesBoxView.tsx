import React, { useState } from 'react';
import { CardConfig, PhotoItem, VoiceNoteData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { YouTubePlayer } from './YouTubePlayer';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { PhotoGallery } from './PhotoGallery';
import { BlueStarBouquet } from './BlueStarBouquet';
import { SpotifyPlayer } from './SpotifyPlayer';
import confetti from 'canvas-confetti';

import flowerPixel from '../image pixel/flower.jpg';
import letterPixel from '../image pixel/letter.jpg';
import polaroidPixel from '../image pixel/polaird.jpg';
import voicePixel from '../image pixel/voice .jpg';
import songPixel from '../image pixel/song.jpg';
import spotifyPixel from '../image pixel/spotify.jpg';
import pointerPixel from '../image pixel/pointer.jpg';

interface GoodiesBoxViewProps {
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
  onRedeemCoupon?: () => void;
  onSwitchToLetterView: () => void;
  onUpdateFlowerPhoto?: (url: string) => void;
  readOnly?: boolean;
}

export const GoodiesBoxView: React.FC<GoodiesBoxViewProps> = ({
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
  onRedeemCoupon,
  onSwitchToLetterView,
  onUpdateFlowerPhoto,
  readOnly = false,
}) => {
  const [activeGoodie, setActiveGoodie] = useState<
    'none' | 'flower' | 'letter' | 'photos' | 'voice' | 'music' | 'spotify'
  >('none');

  const handleFlowerSparkle = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#f472b6', '#fde047'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div id="goodies-box-view" className="w-full flex flex-col items-center select-none font-typewriter">
      {/* Box Header Inspired by boxofgoodies.littleweb.world */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-[#dbeafe] border-2 border-slate-900 px-3.5 py-1 shadow-[3px_3px_0px_0px_#1e293b]">
          <span className="font-pixel text-[11px] font-bold text-sky-950 uppercase tracking-widest">
            ★ A Little Box of Goodies ★
          </span>
        </div>
        <p className="font-handwriting text-slate-600 text-base mt-1.5 italic">
          "Specially packed with sweet care for {config.recipient}"
        </p>
      </div>

      {/* The Physical Care Package Box Interior */}
      <div className="relative w-full bg-[#fcf9f2] border-3 border-slate-900 rounded-sm p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_#1e293b] overflow-hidden">
        {/* Decorative Box Flaps & Airmail Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-[repeating-linear-gradient(45deg,#3b82f6,#3b82f6_10px,#b9d5ee_10px,#b9d5ee_20px,#ffffff_20px,#ffffff_30px)] border-b-2 border-slate-900 opacity-80" />

        {/* Parcel Delivery Tag */}
        <div className="mt-2 mb-4 flex items-center justify-between border-b-2 border-dashed border-slate-400 pb-3">
          <div className="text-left">
            <span className="font-pixel text-[9px] text-slate-500 block uppercase">
              CARE PARCEL TO:
            </span>
            <span className="font-handwriting text-xl text-sky-950 font-bold">
              {config.recipient}
            </span>
          </div>

          <div className="text-right">
            <span className="font-pixel text-[9px] text-slate-500 block uppercase">
              FROM:
            </span>
            <span className="font-handwriting text-lg text-slate-700">
              {config.sender}
            </span>
          </div>
        </div>

        {/* Helpful Prompt Banner */}
        <div className="mb-4 bg-sky-50 border-2 border-slate-900 px-3 py-1.5 flex items-center justify-between text-slate-800 shadow-[2px_2px_0px_0px_#0f172a]">
          <div className="flex items-center gap-1.5 font-pixel text-[9px] font-bold text-sky-900">
            <img
              src={pointerPixel}
              alt="Pointer"
              className="w-3.5 h-3.5 [image-rendering:pixelated] mix-blend-multiply object-contain inline-block"
            />
            <span>[ EXPLORE GOODIES ]</span>
          </div>
          <span className="font-pixel text-[8px] text-slate-500">6 ITEMS INSIDE</span>
        </div>

        {/* Goodies 6-Grid / Bento Box (littleweb.world layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          
          {/* GOODIE 1: Bouquet */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGoodie('flower')}
            className="cursor-pointer bg-white/95 border-3 border-slate-900 p-3 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#0f172a] relative group transition"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-sky-200 border border-slate-900 px-2 py-0.5 font-pixel text-[7px] text-slate-900 font-bold z-10 shadow-xs">
              FLOWER
            </div>

            {/* Pixel Flower Icon */}
            <div className="w-full aspect-square max-w-[120px] flex items-center justify-center my-1 p-2">
              <img
                src={flowerPixel}
                alt="Bouquet"
                className="w-full h-full object-contain [image-rendering:pixelated] mix-blend-multiply group-hover:scale-110 transition-transform duration-200 select-none"
              />
            </div>

            <span className="font-pixel text-[9px] font-bold text-sky-950 uppercase mt-1">
              Bouquet
            </span>
            <span className="font-pixel text-[8px] text-slate-500">
              Blue Stars
            </span>
          </motion.div>

          {/* GOODIE 2: Heartfelt Letter */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGoodie('letter')}
            className="cursor-pointer bg-[#fffef0] border-3 border-slate-900 p-3 flex flex-col items-center justify-between text-center shadow-[4px_4px_0px_0px_#0f172a] relative group transition"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-200 border border-slate-900 px-2 py-0.5 font-pixel text-[7px] text-slate-900 font-bold z-10 shadow-xs">
              LETTER
            </div>

            {/* Pixel Letter Icon */}
            <div className="w-full aspect-square max-w-[120px] flex items-center justify-center my-1 p-1">
              <img
                src={letterPixel}
                alt="Letter"
                className="w-full h-full object-contain [image-rendering:pixelated] mix-blend-multiply group-hover:scale-110 transition-transform duration-200 select-none"
              />
            </div>

            <span className="font-pixel text-[9px] font-bold text-slate-900 uppercase">
          Note
            </span>
            <span className="font-pixel text-[8px] text-slate-500">
              Folded Message
            </span>
          </motion.div>

          {/* GOODIE 3: Polaroid Snaps */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGoodie('photos')}
            className="cursor-pointer bg-white border-3 border-slate-900 p-3 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#0f172a] relative group transition"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-200 border border-slate-900 px-2 py-0.5 font-pixel text-[7px] text-slate-900 font-bold z-10 shadow-xs">
              PHOTOS
            </div>

            {/* Pixel Polaroid Camera Icon */}
            <div className="w-full aspect-square max-w-[120px] flex items-center justify-center my-1 p-2 relative">
              <img
                src={polaroidPixel}
                alt="Polaroid Snaps"
                className="w-full h-full object-contain [image-rendering:pixelated] mix-blend-multiply group-hover:scale-110 transition-transform duration-200 select-none"
              />
              {config.photos.length > 0 && (
                <div className="absolute bottom-1 right-1 bg-white/95 border border-slate-900 px-1 font-pixel text-[6px] text-slate-900 font-bold shadow-xs">
                  {config.photos.length} PICS
                </div>
              )}
            </div>

            <span className="font-pixel text-[9px] font-bold text-slate-900 uppercase mt-1">
              Polaroid Snaps
            </span>
            <span className="font-pixel text-[8px] text-slate-500">
              {config.photos.length > 0 ? `${config.photos.length} Memories` : 'Empty Album'}
            </span>
          </motion.div>

          {/* GOODIE 4: Audio Voice Cassette */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (isPlayingMusic) {
                if (onPauseMusic) onPauseMusic();
                else onTogglePlayMusic();
              }
              setActiveGoodie('voice');
            }}
            className="cursor-pointer bg-[#f8fafc] border-3 border-slate-900 p-3 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#0f172a] relative group transition"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-200 border border-slate-900 px-2 py-0.5 font-pixel text-[7px] text-slate-900 font-bold z-10 shadow-xs">
              AUDIO
            </div>

            {/* Pixel Voice Note Icon (Pop Cat) */}
            <div className="w-full aspect-square max-w-[120px] flex flex-col items-center justify-center my-1 p-2 relative">
              <img
                src={voicePixel}
                alt="Voice Note"
                className="w-full h-full object-contain [image-rendering:pixelated] mix-blend-multiply group-hover:scale-110 transition-transform duration-200 select-none"
              />
              <div className="absolute bottom-1 right-1 bg-violet-100/90 border border-slate-900 px-1 font-pixel text-[6px] text-violet-950 font-bold">
                {config.voiceNote.audioUrl ? `${config.voiceNote.durationSeconds}s` : '9s'}
              </div>
            </div>

            <span className="font-pixel text-[9px] font-bold text-slate-900 uppercase">
              Voice Cassette
            </span>
            <span className="font-pixel text-[8px] text-slate-500">
              Personal Message
            </span>
          </motion.div>

          {/* GOODIE 5: YouTube Mixtape */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGoodie('music')}
            className="cursor-pointer bg-[#eff6ff] border-3 border-slate-900 p-3 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#0f172a] relative group transition"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-300 border border-slate-900 px-2 py-0.5 font-pixel text-[7px] text-slate-900 font-bold z-10 shadow-xs">
              MIXTAPE
            </div>

            {/* Pixel Vinyl Song Icon */}
            <div className="w-full aspect-square max-w-[120px] flex flex-col items-center justify-center my-1 p-2 relative">
              <img
                src={songPixel}
                alt="Our Playlist"
                className={`w-full h-full object-contain [image-rendering:pixelated] mix-blend-multiply group-hover:scale-110 transition-transform duration-200 select-none ${
                  isPlayingMusic ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              />
              {isPlayingMusic && (
                <div className="absolute bottom-1 right-1 bg-sky-200/90 border border-slate-900 px-1 font-pixel text-[6px] text-sky-950 font-bold">
                  ♪ PLAYING
                </div>
              )}
            </div>

            <span className="font-pixel text-[9px] font-bold text-slate-900 uppercase">
              Our Playlist
            </span>
            <span className="font-pixel text-[8px] text-slate-500">
              {config.playlist.length} Cozy Tracks
            </span>
          </motion.div>

          {/* GOODIE 6: Spotify Soundtrack Track */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGoodie('spotify')}
            className="cursor-pointer bg-[#f0fdf4] border-3 border-slate-900 p-3 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#0f172a] relative group transition"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1ed760] border border-slate-900 px-2 py-0.5 font-pixel text-[7px] text-black font-bold z-10 shadow-xs uppercase">
              SPOTIFY
            </div>

            {/* Pixel Spotify Icon */}
            <div className="w-full aspect-square max-w-[120px] flex flex-col items-center justify-center my-1 p-2 relative">
              <img
                src={spotifyPixel}
                alt="Spotify Audio"
                className="w-full h-full object-contain [image-rendering:pixelated] mix-blend-multiply group-hover:scale-110 transition-transform duration-200 select-none"
              />
            </div>

            <span className="font-pixel text-[9px] font-bold text-slate-900 uppercase">
              Spotify Audio
            </span>
            <span className="font-pixel text-[8px] text-slate-500">
              Tap to listen
            </span>
          </motion.div>

        </div>

        {/* View Switcher Button at Bottom of Box */}
        <div className="mt-6 pt-4 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 font-pixel text-[10px]">
          <span className="text-slate-500">
            Hehehe
          </span>
          <button
            type="button"
            onClick={onSwitchToLetterView}
            className="bg-sky-100 hover:bg-sky-200 text-slate-900 border-2 border-slate-900 px-3 py-1.5 shadow-[2px_2px_0px_0px_#0f172a] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            [ ✦ READ FULL ]
          </button>
        </div>
      </div>

      {/* POPUP / MODAL INSPECTOR FOR EACH GOODIE */}
      <AnimatePresence>
        {activeGoodie !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#faf8f2] border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative font-typewriter"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveGoodie('none')}
                className="absolute top-3 right-3 font-pixel text-xs bg-slate-900 text-white border-2 border-slate-900 px-2 py-0.5 shadow-[2px_2px_0px_0px_#64748b] hover:bg-rose-600 transition cursor-pointer"
              >
                ✕ CLOSE
              </button>

              {/* FLOWER MODAL */}
              {activeGoodie === 'flower' && (
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-1.5 bg-sky-100 border-2 border-slate-900 px-3 py-1 font-pixel text-[10px] text-sky-950 font-bold mb-3 shadow-[2px_2px_0px_0px_#0f172a]">
                    <span>★ BLUE STAR BOUQUET ★</span>
                  </div>

                  {/* BlueStarBouquet — same as letter view, click for sparkles */}
                  <div onClick={handleFlowerSparkle} className="w-full cursor-pointer">
                    <BlueStarBouquet
                      customPhotoUrl={config.flowerPhotoUrl}
                      showMeaning={true}
                      initialMode={config.flowerStyle === 'photo' ? 'photo' : 'illustration'}
                      onUpdateFlowerPhoto={onUpdateFlowerPhoto}
                      readOnly={readOnly}
                      bouquetTitle={config.bouquetTitle}
                      bouquetMeaning={config.bouquetMeaning}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap justify-center gap-2 font-pixel text-[9px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGoodie('none');
                        onSwitchToLetterView();
                      }}
                      className="bg-white text-slate-900 border-2 border-slate-900 px-3 py-1.5 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-slate-100 transition cursor-pointer"
                    >
                      [ SEE IN LETTER VIEW ]
                    </button>
                  </div>
                </div>
              )}

              {/* LETTER MODAL */}
              {activeGoodie === 'letter' && (
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 border-2 border-slate-900 px-3 py-1 font-pixel text-[10px] text-amber-950 font-bold mb-3 shadow-[2px_2px_0px_0px_#0f172a]">
                    <span>★ HEARTFELT LETTER ★</span>
                  </div>
                  <div className="bg-[#fffdfa] border-3 border-slate-900 p-5 shadow-[4px_4px_0px_0px_#1e293b]">
                    <h3 className="font-handwriting text-2xl text-stone-800 font-bold mb-3">
                      {config.letterGreeting}
                    </h3>
                    <div className="font-handwriting text-lg text-stone-700 leading-relaxed whitespace-pre-line space-y-3">
                      {config.letterBody}
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-300 text-right">
                      <span className="font-handwriting text-xl text-sky-900 font-bold block">
                        {config.letterClosing}
                      </span>
                      <span className="font-pixel text-[9px] text-slate-500 block mt-1">
                         {config.deliveryDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PHOTOS MODAL */}
              {activeGoodie === 'photos' && (
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 border-2 border-slate-900 px-3 py-1 font-pixel text-[10px] text-emerald-950 font-bold mb-3 shadow-[2px_2px_0px_0px_#0f172a]">
                    <span>★ POLAROID MEMORIES ★</span>
                  </div>
                  <PhotoGallery
                    photos={config.photos}
                    onAddPhoto={readOnly ? undefined : onAddPhoto}
                    onRemovePhoto={readOnly ? undefined : onRemovePhoto}
                    readOnly={readOnly}
                  />
                </div>
              )}

              {/* VOICE MODAL */}
              {activeGoodie === 'voice' && (
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-violet-100 border-2 border-slate-900 px-3 py-1 font-pixel text-[10px] text-violet-950 font-bold mb-3 shadow-[2px_2px_0px_0px_#0f172a]">
                    <span>★ VOICE CASSETTE TAPE ★</span>
                  </div>
                  <VoiceNotePlayer
                    voiceNote={config.voiceNote}
                    onUpdateVoiceNote={readOnly ? undefined : onUpdateVoiceNote}
                    onPauseMusic={onPauseMusic || (isPlayingMusic ? onTogglePlayMusic : undefined)}
                    readOnly={readOnly}
                  />
                </div>
              )}

              {/* MUSIC MODAL */}
              {activeGoodie === 'music' && (
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-sky-100 border-2 border-slate-900 px-3 py-1 font-pixel text-[10px] text-sky-950 font-bold mb-3 shadow-[2px_2px_0px_0px_#0f172a]">
                    <span>★ CARE PACKAGE MIXTAPE ★</span>
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
              )}

              {/* SPOTIFY MODAL */}
              {activeGoodie === 'spotify' && (
                <div>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-100 border-2 border-slate-900 px-3 py-1 font-pixel text-[10px] text-emerald-950 font-bold shadow-[2px_2px_0px_0px_#0f172a]">
                      <span>★ SPOTIFY SOUNDTRACK ★</span>
                    </div>
                    <p className="font-typewriter text-xs text-slate-600 mt-1">
                      A special tune selected for {config.recipient}
                    </p>
                  </div>

                  <SpotifyPlayer
                    trackId={config.spotifyTrackId || '1kPpge9JDLpcj15qgrPbYX'}
                    spotifyUrl={config.spotifyUrl || 'https://open.spotify.com/track/1kPpge9JDLpcj15qgrPbYX?si=ae31586e710e48bc'}
                  />
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
