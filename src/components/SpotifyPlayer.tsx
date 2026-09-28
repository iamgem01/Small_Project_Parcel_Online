import React from 'react';

interface SpotifyPlayerProps {
  trackId?: string;
  spotifyUrl?: string;
  playlistId?: string;
  playlistUrl?: string;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  trackId = '1kPpge9JDLpcj15qgrPbYX',
  spotifyUrl = 'https://open.spotify.com/track/1kPpge9JDLpcj15qgrPbYX?si=ae31586e710e48bc',
  playlistId = '36rjCoyee7zNGXIUyEhqbm',
  playlistUrl = 'https://open.spotify.com/playlist/36rjCoyee7zNGXIUyEhqbm?si=QSO8nAlGTIKO-IbMESfmlQ',
}) => {
  return (
    <div id="spotify-player-widget" className="w-full font-typewriter space-y-3">
      {/* 1. Spotify Track */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 bg-[#1ed760] text-black border-2 border-slate-900 px-2.5 py-0.5 shadow-[2px_2px_0px_0px_#0f172a]">
            <span className="font-pixel text-[10px] font-black">♫</span>
            <span className="font-pixel text-[9px] font-bold tracking-wider uppercase">
              SPOTIFY TRACK
            </span>
          </div>

          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-[9px] text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center gap-1"
            >
              [ OPEN IN SPOTIFY ↗ ]
            </a>
          )}
        </div>

        {/* Embedded Spotify Track Iframe */}
        <div className="border-3 border-slate-900 bg-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_#0f172a]">
          <iframe
            style={{ borderRadius: '8px' }}
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Track Embed"
            className="w-full"
          />
        </div>
      </div>

      {/* 2. Spotify Playlist (Added right after track) */}
      {playlistId && (
        <div className="space-y-1.5 pt-2 border-t-2 border-dashed border-slate-300">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-emerald-200 text-emerald-950 border-2 border-slate-900 px-2.5 py-0.5 shadow-[2px_2px_0px_0px_#0f172a]">
              <span className="font-pixel text-[10px] font-black">★</span>
              <span className="font-pixel text-[9px] font-bold tracking-wider uppercase">
                SPOTIFY PLAYLIST
              </span>
            </div>

            {playlistUrl && (
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel text-[9px] text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center gap-1"
              >
                [ OPEN PLAYLIST ↗ ]
              </a>
            )}
          </div>

          {/* Embedded Spotify Playlist Iframe */}
          <div className="border-3 border-slate-900 bg-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_#0f172a]">
            <iframe
              style={{ borderRadius: '8px' }}
              src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Playlist Embed"
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
