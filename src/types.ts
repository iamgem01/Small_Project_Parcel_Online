export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  date?: string;
  rotation?: number;
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  coverUrl: string;
  startTime?: number; // Start time in seconds (e.g. 30 for 0:30)
}

export interface VoiceNoteData {
  title: string;
  speaker: string;
  date: string;
  durationSeconds: number;
  audioUrl?: string; // Optional custom audio or blob
  transcript: string;
}

export interface PromiseCoupon {
  id: string;
  title: string;
  perk: string;
  terms: string;
  isRedeemed: boolean;
  redeemedAt?: string;
}

export interface CardConfig {
  passcode: string;
  passcodeHint: string;
  title: string;
  tagline: string;
  recipient: string;
  sender: string;
  trackingCode: string;
  stampText: string;
  deliveryDate: string;
  letterGreeting: string;
  letterBody: string;
  letterClosing: string;
  flowerPhotoUrl?: string;
  flowerStyle?: 'illustration' | 'photo';
  photos: PhotoItem[];
  voiceNote: VoiceNoteData;
  playlist: SongItem[];
  spotifyTrackId?: string;
  spotifyUrl?: string;
  bgMusicYoutubeId?: string;
  bgMusicStartTime?: number;
  coupon?: PromiseCoupon;
  bouquetTitle?: string;
  bouquetMeaning?: string;
}
