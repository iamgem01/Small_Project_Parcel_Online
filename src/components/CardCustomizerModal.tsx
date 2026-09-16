import React, { useState, useEffect } from 'react';
import { CardConfig, SongItem } from '../types';
import { motion } from 'motion/react';

interface CardCustomizerModalProps {
  config: CardConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: CardConfig) => void;
}

export const CardCustomizerModal: React.FC<CardCustomizerModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CardConfig>(config);
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [songTitle, setSongTitle] = useState<string>('');
  const [songArtist, setSongArtist] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync formData whenever modal opens or external config changes
  useEffect(() => {
    if (isOpen) {
      setFormData(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CardConfig, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const extractYouTubeId = (url: string): string => {
    const trimmed = url.trim();
    if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : trimmed;
  };

  const handleAddCustomSong = (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = extractYouTubeId(youtubeInput);
    if (!vidId) {
      alert('Please enter a valid YouTube link.');
      return;
    }

    const newSong: SongItem = {
      id: `custom-song-${Date.now()}`,
      title: songTitle.trim() || 'Favorite Song',
      artist: songArtist.trim() || 'YouTube Music',
      youtubeId: vidId,
      coverUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
    };

    setFormData(prev => ({
      ...prev,
      playlist: [newSong, ...prev.playlist],
    }));

    setYoutubeInput('');
    setSongTitle('');
    setSongArtist('');
  };

  const handleRemoveSong = (id: string) => {
    setFormData(prev => ({
      ...prev,
      playlist: prev.playlist.filter(s => s.id !== id),
    }));
  };

  const handleSaveAndClose = () => {
    onSave({
      ...formData,
      // Always preserve latest voice note so settings modal never overwrites audio
      voiceNote: config.voiceNote,
    });
    onClose();
  };

  const generateShareLink = () => {
    try {
      const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(formData))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#card=${serialized}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.warn(e);
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-typewriter">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        className="bg-white border-4 border-slate-900 max-w-lg w-full max-h-[90vh] flex flex-col shadow-[6px_6px_0px_0px_#000] overflow-hidden"
      >
        {/* Header in English & Indie Pixel style */}
        <div className="px-6 py-4 border-b-3 border-slate-900 flex items-center justify-between bg-sky-100">
          <div>
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-sky-950 uppercase">
              [ CUSTOMIZE ]
            </h3>
            <p className="text-[10px] text-slate-600 font-pixel">
              EDIT MODE — PERSONALIZE YOUR PARCEL CARD
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border-2 border-slate-900 hover:bg-rose-100 text-slate-900 flex items-center justify-center font-pixel text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Section 1: Security & Delivery Info */}
          <div className="space-y-3">
            <h4 className="font-pixel text-[10px] text-sky-950 uppercase tracking-wider">
              1. INFOMATION
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">TO:</label>
                <input
                  type="text"
                  value={formData.recipient}
                  onChange={e => handleInputChange('recipient', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">FROM:</label>
                <input
                  type="text"
                  value={formData.sender}
                  onChange={e => handleInputChange('sender', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">PASSCODE (4-8 DIGITS):</label>
                <input
                  type="text"
                  maxLength={8}
                  value={formData.passcode}
                  onChange={e => handleInputChange('passcode', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 font-pixel font-bold text-sky-800 outline-none focus:bg-sky-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">PASSCODE HINT:</label>
                <input
                  type="text"
                  value={formData.passcodeHint}
                  onChange={e => handleInputChange('passcodeHint', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">CARD TITLE:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-pixel text-[10px]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">TAGLINE:</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => handleInputChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">STAMP TEXT:</label>
                <input
                  type="text"
                  value={formData.stampText}
                  onChange={e => handleInputChange('stampText', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-pixel text-[9px]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">DELIVERY DATE:</label>
                <input
                  type="text"
                  value={formData.deliveryDate}
                  onChange={e => handleInputChange('deliveryDate', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-pixel text-[10px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">TRACKING CODE:</label>
              <input
                type="text"
                value={formData.trackingCode}
                onChange={e => handleInputChange('trackingCode', e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-mono text-xs"
              />
            </div>
          </div>

          {/* Section 2: DrawingContent */}
          <div className="space-y-3 pt-4 border-t-2 border-slate-200">
            <h4 className="font-pixel text-[10px] text-sky-950 uppercase tracking-wider">
              2. Drawing 
            </h4>
             <div>
              <label className="block text-slate-700 font-semibold mb-1">TITLE:</label>
              <input
                type="text"
                value={formData.bouquetTitle ?? 'A gentle bouquet of Blue Stars'}
                onChange={e => handleInputChange('bouquetTitle', e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-handwriting text-base"
                placeholder="A gentle bouquet of Blue Stars"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">MEANING / QUOTE:</label>
              <textarea
                rows={3}
                value={formData.bouquetMeaning ?? 'Symbolizing everlasting trust, genuine sincerity, and a quiet love as pure as the morning sky.'}
                onChange={e => handleInputChange('bouquetMeaning', e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 text-xs font-typewriter leading-relaxed"
                placeholder="Symbolizing everlasting trust..."
              />
            </div>
            
            {/* File Upload or Drag & Drop */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                UPLOAD sth IMAGE FROM DEVICE:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      handleInputChange('flowerPhotoUrl', reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:border-2 file:border-slate-900 file:text-xs file:bg-sky-100 file:font-pixel file:text-sky-950 file:cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                OR PASTE URL HERE:
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.flowerPhotoUrl || ''}
                onChange={e => handleInputChange('flowerPhotoUrl', e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 text-xs font-mono"
              />
            </div>

            {formData.flowerPhotoUrl && (
              <div className="flex items-center gap-2 p-2 bg-sky-50 border border-sky-300">
                <img
                  src={formData.flowerPhotoUrl}
                  alt="Flower Preview"
                  className="w-10 h-10 object-cover border border-slate-900"
                />
                <span className="font-pixel text-[8px] text-emerald-800">
                  ✓ SELECTED
                </span>
                <button
                  type="button"
                  onClick={() => handleInputChange('flowerPhotoUrl', '')}
                  className="ml-auto font-pixel text-[8px] text-rose-600 underline cursor-pointer"
                >
                  CLEAR / USE DEFAULT
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Letter Wishes */}
          <div className="space-y-3 pt-4 border-t-2 border-slate-200">
            <h4 className="font-pixel text-[10px] text-sky-950 uppercase tracking-wider">
              3. LETTER
            </h4>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">LETTER GREETING:</label>
              <input
                type="text"
                value={formData.letterGreeting}
                onChange={e => handleInputChange('letterGreeting', e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-handwriting text-base"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">LETTER BODY:</label>
              <textarea
                rows={5}
                value={formData.letterBody}
                onChange={e => handleInputChange('letterBody', e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-handwriting text-base leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">CLOSING:</label>
              <input
                type="text"
                value={formData.letterClosing}
                onChange={e => handleInputChange('letterClosing', e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-handwriting text-base"
              />
            </div>
          </div>

          {/* Section 4: YouTube Music */}
          <div className="space-y-3 pt-4 border-t-2 border-slate-200">
            <h4 className="font-pixel text-[10px] text-sky-950 uppercase tracking-wider">
              4. SONG PLAYLIST (YOUTUBE)
            </h4>

            <div className="p-3 bg-sky-50 border-2 border-slate-900 space-y-2">
              <p className="text-slate-800 font-pixel text-[9px]">Add song via youtube link:</p>
              <input
                type="text"
                placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=...)"
                value={youtubeInput}
                onChange={e => setYoutubeInput(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-slate-900 text-xs outline-none focus:bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Song Title"
                  value={songTitle}
                  onChange={e => setSongTitle(e.target.value)}
                  className="px-3 py-1.5 border-2 border-slate-900 text-xs"
                />
                <input
                  type="text"
                  placeholder="Artist"
                  value={songArtist}
                  onChange={e => setSongArtist(e.target.value)}
                  className="px-3 py-1.5 border-2 border-slate-900 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomSong}
                className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-pixel text-[10px] border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] transition active:translate-x-0.5 active:translate-y-0.5"
              >
                + ADD TO PLAYLIST
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {formData.playlist.map(song => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2 bg-stone-50 border border-slate-300 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-pixel text-[8px] text-sky-700">[YT]</span>
                    <span className="font-semibold truncate">{song.title}</span>
                    <span className="text-slate-500 truncate">- {song.artist}</span>
                  </div>
                  {formData.playlist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSong(song.id)}
                      className="text-slate-400 hover:text-rose-600 px-1 font-pixel text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Voice Note Transcript */}
          <div className="space-y-3 pt-4 border-t-2 border-slate-200">
            <h4 className="font-pixel text-[10px] text-sky-950 uppercase tracking-wider">
              5. VOICE NOTE TRANSCRIPT
            </h4>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Describe your voice note:
              </label>
              <textarea
                rows={2}
                value={formData.voiceNote.transcript}
                onChange={e =>
                  handleInputChange('voiceNote', {
                    ...formData.voiceNote,
                    transcript: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border-2 border-slate-900 outline-none focus:bg-sky-50 font-handwriting text-base"
              />
            </div>
          </div>

          {/* Section 6: Spotify Track */}
          <div className="space-y-3 pt-4 border-t-2 border-slate-200">
            <h4 className="font-pixel text-[10px] text-emerald-900 uppercase tracking-wider">
              6. SPOTIFY SOUNDTRACK
            </h4>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Url:
              </label>
              <input
                type="text"
                value={formData.spotifyUrl || ''}
                placeholder="https://open.spotify.com/track/..."
                onChange={e => {
                  const url = e.target.value;
                  const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
                  const trackId = trackMatch ? trackMatch[1] : formData.spotifyTrackId;
                  setFormData(prev => ({
                    ...prev,
                    spotifyUrl: url,
                    spotifyTrackId: trackId,
                  }));
                }}
                className="w-full px-3 py-1.5 border-2 border-slate-900 outline-none focus:bg-emerald-50 text-xs font-mono"
              />
            </div>
            {formData.spotifyTrackId && (
              <p className="font-pixel text-[9px] text-emerald-700">
                ✓ TRACK ID DETECTED: {formData.spotifyTrackId}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-3 border-slate-900 bg-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={generateShareLink}
            className="px-3 py-2 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 font-pixel text-[10px] shadow-[2px_2px_0px_0px_#0f172a] transition active:translate-x-0.5 active:translate-y-0.5"
          >
            {isCopied ? '[ ✓ LINK COPIED! ]' : '[ SHARE LINK ]'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border-2 border-slate-900 bg-stone-200 hover:bg-stone-300 text-slate-700 font-pixel text-[10px]"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-4 py-2 border-2 border-slate-900 bg-sky-600 hover:bg-sky-500 text-white font-pixel text-[10px] shadow-[2px_2px_0px_0px_#0f172a] transition active:translate-x-0.5 active:translate-y-0.5"
            >
              SAVE CHANGES
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
