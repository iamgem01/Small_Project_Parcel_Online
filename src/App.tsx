import React, { useState, useEffect, useCallback } from 'react';
import { CardConfig, PhotoItem, VoiceNoteData } from './types';
import { DEFAULT_CARD_CONFIG } from './defaultData';
import { PasscodeModal } from './components/PasscodeModal';
import { ParachuteDropScene } from './components/ParachuteDropScene';
import { VintageNoteCard } from './components/VintageNoteCard';
import { CardCustomizerModal } from './components/CardCustomizerModal';
import { ShareModal } from './components/ShareModal';
import { StarryBackground } from './components/StarryBackground';

// ─── Server API helpers ─────────────────────────────────────────
const API_BASE = '/api/cards';

export async function loadCardFromServer(id: string): Promise<CardConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data.config as CardConfig) : null;
  } catch {
    return null;
  }
}

export async function saveCardToServer(
  config: CardConfig,
  existingId?: string
): Promise<string | null> {
  try {
    const method = existingId ? 'PUT' : 'POST';
    const url = existingId ? `${API_BASE}/${existingId}` : API_BASE;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data.id : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [config, setConfig] = useState<CardConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        let baseConfig = DEFAULT_CARD_CONFIG;
        const hash = window.location.hash;
        if (hash.startsWith('#card=')) {
          const encoded = hash.replace('#card=', '');
          const parsed = JSON.parse(decodeURIComponent(escape(atob(encoded))));
          baseConfig = { ...DEFAULT_CARD_CONFIG, ...parsed };
        } else {
          const saved = localStorage.getItem('vintage_card_config');
          if (saved) {
            const parsed = JSON.parse(saved);
            // If previous session used old passcode '1601', prioritize updated default '2909'
            if (parsed.passcode === '1601') {
              baseConfig = DEFAULT_CARD_CONFIG;
            } else {
              const cleanedPhotos = (parsed.photos || []).filter(
              (p: any) => p.id !== 'photo-1' && p.id !== 'photo-2'
            );
            const flowerPhoto = parsed.flowerPhotoUrl && !parsed.flowerPhotoUrl.includes('unsplash')
              ? parsed.flowerPhotoUrl
              : DEFAULT_CARD_CONFIG.flowerPhotoUrl;

            baseConfig = {
              ...DEFAULT_CARD_CONFIG,
              ...parsed,
              flowerPhotoUrl: flowerPhoto,
              photos: cleanedPhotos.length > 0 ? cleanedPhotos : DEFAULT_CARD_CONFIG.photos,
            };
            }
          }
        }

        // Hydrate voice note from isolated key if present and base has no audio
        const savedVoice = localStorage.getItem('vintage_voice_note');
        if (savedVoice) {
          try {
            const parsedVoice = JSON.parse(savedVoice);
            if (parsedVoice?.audioUrl && !baseConfig.voiceNote?.audioUrl) {
              baseConfig = {
                ...baseConfig,
                voiceNote: { ...baseConfig.voiceNote, ...parsedVoice },
              };
            }
          } catch {}
        }

        return baseConfig;
      } catch (e) {
        console.warn('Could not parse saved config:', e);
      }
    }
    return DEFAULT_CARD_CONFIG;
  });

  const [isRecipientMode, setIsRecipientMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get('view') === 'recipient' ||
        params.get('mode') === 'view' ||
        params.get('readonly') === 'true'
      );
    }
    return false;
  });

  const [stage, setStage] = useState<'locked' | 'dropping' | 'unpacked'>('locked');
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  // ID của card đang lưu trên server (nếu đã lưu)
  const [serverCardId, setServerCardId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('cid') ?? null;
  });

  const activeSong = config.playlist[currentSongIndex] || config.playlist[0];
  const activeYoutubeId = activeSong?.youtubeId || config.bgMusicYoutubeId || 'vk0AR1EkkcU';
  const activeStartTime = activeSong?.startTime ?? (currentSongIndex === 0 ? (config.bgMusicStartTime ?? 30) : 0);

  // Load config từ server khi có ?cid= trong URL (kèm logic merge bảo toàn voice note)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get('cid');
    if (cid) {
      loadCardFromServer(cid).then(serverConfig => {
        if (serverConfig) {
          setConfig(prev => {
            // Lấy voice note cục bộ nếu có
            let localVoice = prev.voiceNote?.audioUrl ? prev.voiceNote : null;
            if (!localVoice && typeof window !== 'undefined') {
              try {
                const sv = localStorage.getItem('vintage_voice_note');
                if (sv) localVoice = JSON.parse(sv);
              } catch {}
            }
            // Nếu server chưa có audioUrl nhưng client đã có, giữ lại audioUrl client
            const mergedVoice = (serverConfig.voiceNote && serverConfig.voiceNote.audioUrl)
              ? serverConfig.voiceNote
              : (localVoice || serverConfig.voiceNote || DEFAULT_CARD_CONFIG.voiceNote);

            return {
              ...DEFAULT_CARD_CONFIG,
              ...serverConfig,
              voiceNote: mergedVoice,
            };
          });
          setServerCardId(cid);
        }
      });
    }
  }, []);

  // Lưu vào localStorage mỗi khi config thay đổi (backup)
  useEffect(() => {
    try {
      localStorage.setItem('vintage_card_config', JSON.stringify(config));
    } catch (e) {
      console.warn('localStorage card_config write error:', e);
    }
  }, [config]);

  /** Lưu card lên server (gọi từ ShareModal) */
  const handleSaveToServer = useCallback(async (): Promise<string | null> => {
    const id = await saveCardToServer(config, serverCardId ?? undefined);
    if (id) {
      setServerCardId(id);
      // Cập nhật URL với ?cid= để dễ share
      const url = new URL(window.location.href);
      url.searchParams.set('cid', id);
      window.history.replaceState({}, '', url.toString());
    }
    return id;
  }, [config, serverCardId]);

  const handlePasscodeSuccess = () => {
    setStage('dropping');
    // Start background music as requested
    setIsPlayingMusic(true);
  };

  const handleOpenCard = () => {
    setStage('unpacked');
    setIsPlayingMusic(true);
  };

  const handlePlaySong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlayingMusic(true);
  };

  const handleTogglePlayMusic = () => {
    setIsPlayingMusic(prev => !prev);
  };

  const handleNextSong = () => {
    setCurrentSongIndex(prev => (prev + 1) % config.playlist.length);
    setIsPlayingMusic(true);
  };

  const handlePrevSong = () => {
    setCurrentSongIndex(prev => (prev - 1 + config.playlist.length) % config.playlist.length);
    setIsPlayingMusic(true);
  };

  const handleAddPhoto = (newPhoto: PhotoItem) => {
    setConfig(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto],
    }));
  };

  const handleRemovePhoto = (id: string) => {
    setConfig(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id),
    }));
  };

  const handleUpdateFlowerPhoto = (photoUrl: string) => {
    setConfig(prev => ({
      ...prev,
      flowerPhotoUrl: photoUrl,
    }));
  };

  const handleUpdateVoiceNote = async (updatedVoice: VoiceNoteData) => {
    // 1. Cập nhật state cục bộ
    setConfig(prev => ({
      ...prev,
      voiceNote: updatedVoice,
    }));

    // 2. Lưu vào storage riêng biệt để không bao giờ bị ảnh hưởng bởi quota 5MB của photos/flower
    try {
      localStorage.setItem('vintage_voice_note', JSON.stringify(updatedVoice));
    } catch (e) {
      console.warn('Lỗi khi lưu voice note vào localStorage:', e);
    }

    // 3. Tự động đồng bộ lên backend server ngay lập tức
    try {
      const updatedConfig = {
        ...config,
        voiceNote: updatedVoice,
      };
      const id = await saveCardToServer(updatedConfig, serverCardId ?? undefined);
      if (id && !serverCardId) {
        setServerCardId(id);
        const url = new URL(window.location.href);
        url.searchParams.set('cid', id);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {
      console.warn('Lỗi khi tự động lưu voice note lên server:', e);
    }
  };

  const handleSaveConfig = (newConfig: CardConfig) => {
    setConfig(newConfig);
  };

  const handleRedeemCoupon = () => {
    setConfig(prev => ({
      ...prev,
      coupon: prev.coupon
        ? { ...prev.coupon, isRedeemed: true, redeemedAt: new Date().toISOString() }
        : undefined,
    }));
  };

  const handleReset = () => {
    setIsPlayingMusic(false);
    setStage('locked');
  };

  const toggleRecipientMode = (enabled: boolean) => {
    setIsRecipientMode(enabled);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (enabled) {
        url.searchParams.set('view', 'recipient');
      } else {
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <main
      id="app-root"
      /* Warm Beige background for the outer region with soft cosmic depth */
      className="min-h-screen w-full bg-[#eae3d2] flex flex-col items-center justify-start p-3 sm:p-6 select-none relative overflow-x-hidden font-typewriter"
    >
      {/* Rich Twinkling Starfield in the Background */}
      <StarryBackground />

      {/* Floating Top Quick Bar in English & Indie Pixel style */}
      <header className="w-full max-w-md flex items-center justify-between py-2 px-3.5 mb-2.5 text-xs bg-[#faf7ee] border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1e293b] z-30 font-pixel">
        <div className="font-bold tracking-wider text-sky-950 text-[10px] flex items-center gap-1.5">
          <span>★ PARCEL ONLINE ★</span>
          {isRecipientMode && (
            <span className="bg-emerald-100 text-emerald-800 text-[7px] px-1.5 py-0.5 border border-emerald-700">
              [LOCKED]
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[9px]">
          {/* Global Music toggle button */}
          <button
            id="global-music-toggle-btn"
            type="button"
            onClick={handleTogglePlayMusic}
            className={`w-7 h-7 border border-slate-900 transition flex items-center justify-center cursor-pointer text-base leading-none ${
              isPlayingMusic
                ? 'bg-emerald-200 text-emerald-950 shadow-[1px_1px_0px_0px_#0f172a]'
                : 'bg-stone-200 hover:bg-stone-300 text-slate-700'
            }`}
            title={isPlayingMusic ? 'Pause music' : 'Play music'}
          >
            {isPlayingMusic ? '♫' : '♪'}
          </button>

          {stage === 'unpacked' && (
            <button
              type="button"
              onClick={handleReset}
              className="w-7 h-7 hover:bg-[#ede6d4] text-slate-800 border border-slate-700 transition cursor-pointer text-base leading-none flex items-center justify-center"
              title="Lock parcel and replay drop animation"
            >
              ↺
            </button>
          )}

          {/* Share / Publish modal trigger */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="w-7 h-7 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-slate-900 transition flex items-center justify-center cursor-pointer text-base leading-none"
            title="Share & publish"
          >
            ⬆
          </button>

          /* {/* Customize only visible in creator mode (hidden for recipient) */}
          {!isRecipientMode && (
            <button
              id="open-settings-btn"
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="w-7 h-7 bg-sky-100 hover:bg-sky-200 text-sky-950 border border-slate-900 transition flex items-center justify-center cursor-pointer text-base leading-none"
              title="Card settings & customizer"
            >
              ⚙
            </button>
          )} */
        </div>
      </header>

      {/* Global Background Audio Stream across entire website */}
      <div className="sr-only pointer-events-none" aria-hidden="true">
        <iframe
          key={`${activeYoutubeId}-${isPlayingMusic}-${activeStartTime}`}
          id="global-background-audio"
          width="200"
          height="200"
          src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=${
            isPlayingMusic ? 1 : 0
          }&start=${activeStartTime}&loop=1&playlist=${activeYoutubeId}&controls=0&mute=0&playsinline=1&enablejsapi=1&origin=${
            typeof window !== 'undefined' ? window.location.origin : ''
          }`}
          title="Background Music Stream"
          allow="autoplay; encrypted-media"
          className="w-0 h-0 opacity-0"
        />
      </div>

      {/* Dynamic Views by Stage */}
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {stage === 'locked' && (
          <PasscodeModal
            correctPasscode={config.passcode}
            hint={config.passcodeHint}
            recipient={config.recipient}
            sender={config.sender}
            onSuccess={handlePasscodeSuccess}
          />
        )}

        {stage === 'dropping' && (
          <ParachuteDropScene
            recipient={config.recipient}
            sender={config.sender}
            onOpenCard={handleOpenCard}
          />
        )}

        {stage === 'unpacked' && (
          <VintageNoteCard
            config={config}
            currentSongIndex={currentSongIndex}
            isPlayingMusic={isPlayingMusic}
            onPlaySong={handlePlaySong}
            onTogglePlayMusic={handleTogglePlayMusic}
            onPauseMusic={() => setIsPlayingMusic(false)}
            onNextSong={handleNextSong}
            onPrevSong={handlePrevSong}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onUpdateVoiceNote={handleUpdateVoiceNote}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onResetToLock={handleReset}
            onRedeemCoupon={handleRedeemCoupon}
            onUpdateFlowerPhoto={handleUpdateFlowerPhoto}
            readOnly={isRecipientMode}
            onOpenShare={() => setIsShareModalOpen(true)}
          />
        )}
      </div>

      {/* Share / Publish Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={config}
        isRecipientMode={isRecipientMode}
        onToggleRecipientMode={toggleRecipientMode}
        onSaveToServer={handleSaveToServer}
        serverCardId={serverCardId}
      />

      {/* Card Customizer Modal (Only in edit mode) */}
      {!isRecipientMode && (
        <CardCustomizerModal
          config={config}
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          onSave={handleSaveConfig}
        />
      )}
    </main>
  );
}
