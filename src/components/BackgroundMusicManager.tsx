import React, { useEffect, useRef } from 'react';

interface BackgroundMusicManagerProps {
  youtubeId: string;
  startTime: number;
  isPlaying: boolean;
  targetVolume?: number; // 0-100, default 50
  fadeDurationMs?: number; // default 2400ms for gentle fade in
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const BackgroundMusicManager: React.FC<BackgroundMusicManagerProps> = ({
  youtubeId,
  startTime,
  isPlaying,
  targetVolume = 50,
  fadeDurationMs = 2400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef<boolean>(false);
  const currentVolumeRef = useRef<number>(0);
  const fadeIntervalRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string>(youtubeId);
  const currentStartTimeRef = useRef<number>(startTime);
  const isPlayingRef = useRef<boolean>(isPlaying);

  isPlayingRef.current = isPlaying;

  const clearFadeTimer = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  /**
   * Smoothly ramps volume up from 0 to targetVolume over fadeDurationMs
   */
  const startFadeIn = () => {
    clearFadeTimer();
    const player = playerRef.current;
    if (!player || !isReadyRef.current) return;

    try {
      player.unMute();
      player.setVolume(0);
      currentVolumeRef.current = 0;
      player.playVideo();

      const stepTimeMs = 60;
      const totalSteps = Math.max(10, Math.round(fadeDurationMs / stepTimeMs));
      const stepIncrement = targetVolume / totalSteps;

      fadeIntervalRef.current = setInterval(() => {
        currentVolumeRef.current = Math.min(targetVolume, currentVolumeRef.current + stepIncrement);
        const rounded = Math.round(currentVolumeRef.current);
        try {
          player.setVolume(rounded);
        } catch {}

        if (currentVolumeRef.current >= targetVolume) {
          clearFadeTimer();
        }
      }, stepTimeMs);
    } catch (e) {
      console.warn('Fade-in error:', e);
    }
  };

  /**
   * Smoothly ramps volume down from current volume to 0, then pauses
   */
  const startFadeOut = (onComplete?: () => void) => {
    clearFadeTimer();
    const player = playerRef.current;
    if (!player || !isReadyRef.current) {
      if (onComplete) onComplete();
      return;
    }

    try {
      let vol = currentVolumeRef.current;
      if (typeof player.getVolume === 'function') {
        try {
          const actual = player.getVolume();
          if (actual > 0) vol = actual;
        } catch {}
      }

      const stepTimeMs = 50;
      const totalSteps = 20; // ~1.0s fade out
      const stepDecrement = Math.max(1, vol / totalSteps);

      fadeIntervalRef.current = setInterval(() => {
        vol = Math.max(0, vol - stepDecrement);
        currentVolumeRef.current = vol;
        try {
          player.setVolume(Math.round(vol));
        } catch {}

        if (vol <= 0) {
          clearFadeTimer();
          try {
            player.pauseVideo();
          } catch {}
          if (onComplete) onComplete();
        }
      }, stepTimeMs);
    } catch {
      if (onComplete) onComplete();
    }
  };

  // Initialize YT.Player
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || playerRef.current || !window.YT || !window.YT.Player) return;

      const playerDiv = document.getElementById('global-yt-player-target');
      if (!playerDiv) return;

      try {
        playerRef.current = new window.YT.Player('global-yt-player-target', {
          height: '200',
          width: '200',
          videoId: currentVideoIdRef.current,
          playerVars: {
            autoplay: 0,
            start: currentStartTimeRef.current,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              isReadyRef.current = true;
              try {
                event.target.setVolume(0);
                event.target.mute();
              } catch {}

              // If playback was already triggered, start gentle fade-in
              if (isPlayingRef.current) {
                setTimeout(() => {
                  if (isMounted && isPlayingRef.current) {
                    startFadeIn();
                  }
                }, 100);
              }
            },
            onStateChange: (event: any) => {
              // Loop song when it reaches the end
              if (event.data === window.YT.PlayerState.ENDED) {
                try {
                  event.target.seekTo(currentStartTimeRef.current || 0);
                  event.target.playVideo();
                } catch {}
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player background playback note:', err);
            },
          },
        });
      } catch (err) {
        console.warn('Could not initialize YT.Player:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      isMounted = false;
      clearFadeTimer();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      isReadyRef.current = false;
    };
  }, []);

  // Handle Play / Pause with Smooth Fade In / Fade Out
  useEffect(() => {
    if (!isReadyRef.current) return;

    if (isPlaying) {
      startFadeIn();
    } else {
      startFadeOut();
    }
  }, [isPlaying]);

  // Handle Song Switch (Change YouTube ID or start time)
  useEffect(() => {
    const isSongDifferent =
      youtubeId !== currentVideoIdRef.current || startTime !== currentStartTimeRef.current;

    if (!isSongDifferent) return;

    currentVideoIdRef.current = youtubeId;
    currentStartTimeRef.current = startTime;

    if (!playerRef.current || !isReadyRef.current) return;

    if (isPlayingRef.current) {
      // Fade out old song, then load new song and fade in!
      startFadeOut(() => {
        try {
          playerRef.current.loadVideoById({
            videoId: youtubeId,
            startSeconds: startTime,
          });
          startFadeIn();
        } catch {}
      });
    } else {
      try {
        playerRef.current.cueVideoById({
          videoId: youtubeId,
          startSeconds: startTime,
        });
      } catch {}
    }
  }, [youtubeId, startTime]);

  return (
    <div
      ref={containerRef}
      className="sr-only pointer-events-none fixed top-0 left-0 w-0 h-0 overflow-hidden"
      aria-hidden="true"
    >
      <div id="global-yt-player-target" />
    </div>
  );
};
