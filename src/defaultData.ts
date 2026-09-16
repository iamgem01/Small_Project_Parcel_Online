import { CardConfig } from './types';

export const DEFAULT_CARD_CONFIG: CardConfig = {
  passcode: '2909',
  passcodeHint: 'ahahah i think u no need this :>',
  title: 'Your Letter',
  tagline: 'what they packed',
  recipient: 'Ael',
  sender: 'someone',
  trackingCode: '2026 0929 4001 0004 03',
  stampText: 'to be delivered with care and love',
  deliveryDate: 'SEPTEMBER 29, 2026',
  flowerPhotoUrl: '/default-flower.png',
  letterGreeting: 'Dear Ael stinky',
  letterBody: `At 24, you re old 🥸 enough to know what matters and young enough to make it happen, keep shining, keep growing!

I know you love yourself but i’m still wishing you with a strong body, good health, a peaceful mind, genuine happiness, and a lot a, lot of the courage you need for what comes next, enjoy jagiyaaaa !`,
  letterClosing: 'Heheheh 💙',
  photos: [
    {
      id: 'photo-default-1',
      url: '/default-photo.jpg',
      caption: 'Gayyyyy',
    },
  ],
  voiceNote: {
    title: 'VOICE CASSETTE FOR YOU',
    speaker: 'someone',
    date: 'SEP 29 • 00:09',
    durationSeconds: 20,
    transcript: ' jagiyaaaa!',
    audioUrl: '/default-voice.webm',
  },
  bgMusicYoutubeId: 'vk0AR1EkkcU',
  bgMusicStartTime: 30,
  spotifyTrackId: '1kPpge9JDLpcj15qgrPbYX',
  spotifyUrl: 'https://open.spotify.com/track/1kPpge9JDLpcj15qgrPbYX?si=ae31586e710e48bc',
  playlist: [
    {
      id: 'song-1',
      title: 'Dance with Me',
      artist: 'beabadoobee',
      youtubeId: 'vk0AR1EkkcU',
      coverUrl: 'https://i.ytimg.com/vi/vk0AR1EkkcU/hqdefault.jpg',
    },
  ],
  flowerStyle: 'illustration',
  coupon: undefined,
};
