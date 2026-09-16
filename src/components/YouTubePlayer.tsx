import React, { useState, useEffect } from 'react';
import { SongItem } from '../types';

interface YouTubePlayerProps {
  playlist: SongItem[];
  currentSongIndex: number;
  isPlaying: boolean;
  onPlaySong: (index: number) => void;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  playlist,
  currentSongIndex,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onNextSong,
  onPrevSong,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const activeSong = playlist[currentSongIndex] || playlist[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSongIndex]);

  useEffect(() => {
    setProgress(0);
  }, [currentSongIndex]);

  return (
    <div id="youtube-player-section" className="w-full font-typewriter">
      {/* Song list cards in English & Blue Tone */}
      <div className="space-y-3">
        {playlist.map((song, index) => {
          const isThisPlaying = isPlaying && currentSongIndex === index;
          const isThisActive = currentSongIndex === index;

          return (
            <div
              key={song.id}
              id={`song-card-${song.id}`}
              className={`group relative rounded-sm p-3.5 transition-all duration-150 border-3 border-slate-900 ${
                isThisActive
                  ? 'bg-[#1e3a8a] text-white shadow-[4px_4px_0px_0px_#0f172a]'
                  : 'bg-[#1e40af] hover:bg-[#1d4ed8] text-white shadow-[2px_2px_0px_0px_#0f172a]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Album Thumbnail */}
                <div className="relative w-14 h-14 border-2 border-slate-900 bg-stone-900 shrink-0 shadow-xs">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isThisPlaying && (
                    <div className="absolute inset-0 bg-blue-950/40 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-sky-200 animate-bounce [animation-delay:-0.3s] h-3" />
                        <span className="w-1 bg-sky-200 animate-bounce [animation-delay:-0.15s] h-4" />
                        <span className="w-1 bg-sky-200 animate-bounce h-2" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate tracking-tight text-white">
                    {song.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] uppercase font-pixel tracking-wider bg-white/20 px-1.5 py-0.5 rounded-xs text-sky-100">
                      YOUTUBE
                    </span>
                    <p className="text-xs text-sky-100/90 truncate">{song.artist}</p>
                  </div>

                  {/* YouTube link in English */}
                  <a
                    href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] text-sky-200/90 hover:text-white mt-1 underline-offset-2 hover:underline font-mono"
                    onClick={e => e.stopPropagation()}
                  >
                    [ Watch on YouTube ↗ ]
                  </a>
                </div>

                {/* Play / Pause button with Indie Pixel shadow */}
                <button
                  id={`play-btn-${song.id}`}
                  type="button"
                  onClick={() => {
                    if (isThisActive) {
                      onTogglePlay();
                    } else {
                      onPlaySong(index);
                    }
                  }}
                  className="w-10 h-10 border-2 border-slate-900 bg-white hover:bg-sky-100 text-blue-950 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition shrink-0 font-bold text-sm font-pixel"
                  title={isThisPlaying ? 'Pause' : 'Play song'}
                >
                  {isThisPlaying ? '❚❚' : '▶'}
                </button>
              </div>

              {/* Progress line */}
              {isThisActive && (
                <div className="mt-2.5 pt-1.5 border-t border-white/20 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-900/60 border border-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-sky-300 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-sky-200 font-pixel">
                    {isPlaying ? 'PLAYING...' : 'PAUSED'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Indie Pixel Mini Controller Bar */}
      <div className="mt-3 p-3 bg-slate-900 text-stone-100 border-3 border-slate-950 shadow-[4px_4px_0px_0px_#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sky-400 font-pixel text-xs">♫</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate text-white">
              {activeSong ? `${activeSong.title} - ${activeSong.artist}` : 'No track selected'}
            </p>
            <p className="text-[9px] text-slate-400 font-pixel">
              {isPlaying ? 'BACKGROUND MUSIC ACTIVE' : 'PRESS ▶ TO PLAY'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 font-pixel text-[10px]">
          <button
            type="button"
            onClick={onPrevSong}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
            title="Previous track"
          >
            |◀
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-7 h-7 bg-sky-500 hover:bg-sky-400 border border-slate-900 text-white flex items-center justify-center transition font-bold"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            onClick={onNextSong}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
            title="Next track"
          >
            ▶|
          </button>
        </div>
      </div>
    </div>
  );
};
