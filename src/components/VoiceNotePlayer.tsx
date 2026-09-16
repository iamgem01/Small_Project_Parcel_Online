import React, { useState, useEffect, useRef } from 'react';
import { VoiceNoteData } from '../types';
import { playGentleMelodyVoice } from '../utils/soundEffects';

interface VoiceNotePlayerProps {
  voiceNote: VoiceNoteData;
  onUpdateVoiceNote?: (updated: VoiceNoteData) => void;
  onPauseMusic?: () => void;
  readOnly?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  voiceNote,
  onUpdateVoiceNote,
  onPauseMusic,
  readOnly = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(voiceNote.audioUrl || null);
  const [audioDuration, setAudioDuration] = useState<number>(voiceNote.durationSeconds || 9);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [transcriptText, setTranscriptText] = useState<string>(voiceNote.transcript);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const melodyControllerRef = useRef<{ stop: () => void } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingSecondsRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Exact duration: if custom audio exists use its duration, otherwise synth demo is 9s
  const duration = recordedAudioUrl ? (audioDuration || voiceNote.durationSeconds || 1) : 9;

  // When VoiceNotePlayer opens, automatically turn off / pause background music
  useEffect(() => {
    if (onPauseMusic) {
      onPauseMusic();
    }
  }, [onPauseMusic]);

  // Sync state if prop changes
  useEffect(() => {
    setRecordedAudioUrl(voiceNote.audioUrl || null);
    setTranscriptText(voiceNote.transcript);
    if (voiceNote.durationSeconds) {
      setAudioDuration(voiceNote.durationSeconds);
    }
  }, [voiceNote.audioUrl, voiceNote.transcript, voiceNote.durationSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (melodyControllerRef.current) {
        melodyControllerRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (melodyControllerRef.current) {
        melodyControllerRef.current.stop();
        melodyControllerRef.current = null;
        setCurrentTime(0);
      }
      setIsPlaying(false);
    } else {
      // Auto pause music when playing voice
      if (onPauseMusic) {
        onPauseMusic();
      }
      setIsPlaying(true);
      if (recordedAudioUrl && audioRef.current) {
        audioRef.current.play().catch(e => console.warn('Audio play failed', e));
      } else {
        setCurrentTime(0);
        melodyControllerRef.current = playGentleMelodyVoice(
          () => {
            // onEnded
            setIsPlaying(false);
            setCurrentTime(0);
            melodyControllerRef.current = null;
          },
          (currentSec) => {
            // onProgress
            setCurrentTime(currentSec);
          }
        );
      }
    }
  };

  const onAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const onAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!recordedAudioUrl || !audioRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.floor(newPercent * duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const startRecording = async () => {
    // Auto pause music when recording starts
    if (onPauseMusic) {
      onPauseMusic();
    }
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (melodyControllerRef.current) {
        melodyControllerRef.current.stop();
        melodyControllerRef.current = null;
      }
      setIsPlaying(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Convert audio Blob into Base64 Data URL so it saves permanently into localStorage & server
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const dur = recordingSecondsRef.current || 5;
          setRecordedAudioUrl(base64Audio);
          setAudioDuration(dur);
          if (onUpdateVoiceNote) {
            onUpdateVoiceNote({
              ...voiceNote,
              audioUrl: base64Audio,
              durationSeconds: dur,
            });
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;

      recordingTimerRef.current = setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access error:', err);
      alert('Could not access microphone. Please allow microphone permissions in your browser or use the UPLOAD button to pick an audio file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Upload an existing audio file (MP3, WAV, M4A, WEBM)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onPauseMusic) {
      onPauseMusic();
    }
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (melodyControllerRef.current) {
        melodyControllerRef.current.stop();
        melodyControllerRef.current = null;
      }
      setIsPlaying(false);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result as string;
      setRecordedAudioUrl(base64Audio);

      // Measure audio duration
      const tempAudio = new Audio(base64Audio);
      tempAudio.onloadedmetadata = () => {
        const dur = Math.round(tempAudio.duration) || 15;
        setAudioDuration(dur);
        if (onUpdateVoiceNote) {
          onUpdateVoiceNote({
            ...voiceNote,
            audioUrl: base64Audio,
            durationSeconds: dur,
          });
        }
      };
      // Fallback if metadata event doesn't fire
      tempAudio.onerror = () => {
        const dur = 15;
        setAudioDuration(dur);
        if (onUpdateVoiceNote) {
          onUpdateVoiceNote({
            ...voiceNote,
            audioUrl: base64Audio,
            durationSeconds: dur,
          });
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Clear custom recording and reset to default
  const handleResetAudio = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (melodyControllerRef.current) {
        melodyControllerRef.current.stop();
        melodyControllerRef.current = null;
      }
      setIsPlaying(false);
    }
    setRecordedAudioUrl(null);
    setCurrentTime(0);
    setAudioDuration(9);
    if (onUpdateVoiceNote) {
      onUpdateVoiceNote({
        ...voiceNote,
        audioUrl: undefined,
        durationSeconds: 9,
      });
    }
  };

  const handleSaveTranscript = () => {
    setIsEditingTranscript(false);
    if (onUpdateVoiceNote) {
      onUpdateVoiceNote({
        ...voiceNote,
        transcript: transcriptText.trim() || voiceNote.transcript,
      });
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0 || !isFinite(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="voice-note-card" className="w-full bg-[#f8fafc] border-3 border-slate-900 rounded-sm p-4 shadow-[4px_4px_0px_0px_#1e293b] relative font-typewriter">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2 mb-3">
        <div>
          <h4 className="font-pixel text-[10px] text-sky-950 uppercase tracking-wider">
            {voiceNote.title}
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">{voiceNote.date}</span>
        </div>

        {/* Action buttons: Record or Upload (only in edit mode) */}
        {!readOnly && (
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileUpload}
              className="hidden"
            />

            {!isRecording ? (
              <>
                <button
                  id="start-record-btn"
                  type="button"
                  onClick={startRecording}
                  className="text-[9px] text-slate-900 font-pixel bg-white px-2 py-1 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a] hover:bg-sky-100 transition cursor-pointer flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                  title="Record voice via microphone"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                  <span>REC</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[9px] text-slate-900 font-pixel bg-white px-2 py-1 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a] hover:bg-sky-100 transition cursor-pointer flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                  title="Upload MP3 or audio file from device"
                >
                  <span>UPLOAD</span>
                </button>

                {recordedAudioUrl && (
                  <button
                    type="button"
                    onClick={handleResetAudio}
                    className="text-[8px] text-slate-600 hover:text-rose-700 font-pixel px-1.5 py-1 border border-slate-400 hover:border-slate-800 transition cursor-pointer"
                    title="Remove custom audio"
                  >
                    ✕
                  </button>
                )}
              </>
            ) : (
              <button
                id="stop-record-btn"
                type="button"
                onClick={stopRecording}
                className="text-[9px] text-rose-700 font-bold font-pixel bg-rose-100 px-2 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] animate-pulse cursor-pointer"
              >
                ■ STOP ({recordingSeconds}s)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Audio Status Pill */}
      <div className="mb-2 flex items-center justify-between text-[8px] font-pixel">
        <span className={recordedAudioUrl ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
          {recordedAudioUrl ? '✓ CUSTOM AUDIO SAVED' : '♫ DEFAULT SYNTH MELODY'}
        </span>
        <span className="text-slate-400">
          {recordedAudioUrl ? `${duration}s RECORDED` : '9s DEMO'}
        </span>
      </div>

      {/* Retro Cassette Spools & Waveform */}
      <div className="bg-[#1e293b] border-2 border-slate-950 p-3 text-slate-200 shadow-inner mb-3">
        <div className="flex items-center justify-between mb-2">
          {/* Left spool */}
          <div className="flex items-center gap-1.5 font-pixel text-[9px] text-sky-300">
            <span className={`inline-block ${isPlaying ? 'animate-spin [animation-duration:3s]' : ''}`}>
              ◎
            </span>
            <span>TAPE-A</span>
          </div>

          {/* Animated sound wave bars */}
          <div className="flex items-center gap-1 h-6 px-2">
            {[4, 12, 18, 9, 22, 14, 20, 8, 16, 12, 24, 10, 15, 6].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-sky-400 rounded-none transition-all duration-150"
                style={{
                  height: isPlaying
                    ? `${Math.max(4, (h * ((i % 3) + 1) * 0.4) % 24)}px`
                    : '4px',
                }}
              />
            ))}
          </div>

          {/* Right spool */}
          <div className="flex items-center gap-1.5 font-pixel text-[9px] text-sky-300">
            <span>SIDE-1</span>
            <span className={`inline-block ${isPlaying ? 'animate-spin [animation-duration:3s]' : ''}`}>
              ◎
            </span>
          </div>
        </div>

        {/* Playback Controls & Timeline */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-700">
          <button
            id="voice-play-pause-btn"
            type="button"
            onClick={handleTogglePlay}
            className="w-8 h-8 border-2 border-slate-900 bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center transition active:translate-x-0.5 active:translate-y-0.5 shrink-0 font-pixel text-xs shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
            title={isPlaying ? 'Pause message' : 'Listen to voice message'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <div className="flex-1">
            <div
              className={`h-2 bg-slate-900 border border-slate-700 overflow-hidden ${recordedAudioUrl ? 'cursor-pointer' : ''}`}
              onClick={handleSeek}
              title={recordedAudioUrl ? 'Click to seek' : undefined}
            >
              <div
                className="h-full bg-sky-400 transition-all duration-200"
                style={{
                  width: `${Math.min(100, Math.max(0, (currentTime / Math.max(1, duration)) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-pixel text-slate-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript / Note Card */}
      <div className="bg-sky-50/80 border-2 border-slate-900 p-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="font-pixel text-[8px] text-slate-500 font-bold uppercase">
            NOTE:
          </span>
          {!readOnly && onUpdateVoiceNote && (
            <button
              type="button"
              onClick={() => {
                if (isEditingTranscript) {
                  handleSaveTranscript();
                } else {
                  setIsEditingTranscript(true);
                }
              }}
              className="font-pixel text-[8px] text-sky-800 hover:underline cursor-pointer"
            >
              {isEditingTranscript ? '[ SAVE NOTE ]' : '[ EDIT NOTE ]'}
            </button>
          )}
        </div>

        {isEditingTranscript ? (
          <div className="space-y-1.5">
            <textarea
              value={transcriptText}
              onChange={e => setTranscriptText(e.target.value)}
              rows={3}
              className="w-full p-2 border-2 border-slate-900 bg-white font-handwriting text-base text-slate-900 outline-none"
              placeholder="Type your message or voice transcript..."
            />
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={handleSaveTranscript}
                className="font-pixel text-[8px] bg-sky-600 text-white px-2 py-0.5 border border-slate-900"
              >
                SAVE
              </button>
            </div>
          </div>
        ) : (
          <p className="font-handwriting text-slate-800 text-sm leading-snug italic">
            {voiceNote.transcript}
          </p>
        )}
      </div>

      {recordedAudioUrl && (
        <audio
          ref={audioRef}
          src={recordedAudioUrl}
          onLoadedMetadata={e => {
            const dur = Math.round(e.currentTarget.duration);
            if (dur && !isNaN(dur) && dur > 0) {
              setAudioDuration(dur);
            }
          }}
          onTimeUpdate={onAudioTimeUpdate}
          onEnded={onAudioEnded}
          className="hidden"
        />
      )}
    </div>
  );
};
