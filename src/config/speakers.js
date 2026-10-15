// =====================================================================
//  TEDx Hero - Speaker & Character Configuration
//  To change the hero character, simply change `activeSpeakerId`
//  or update the portraitUrl / depthUrl paths below.
// =====================================================================

export const SPEAKERS = [
  {
    id: 'speaker-maya',
    name: 'Dr. Maya Lin',
    role: 'Neuro-AI Researcher & Ethicist',
    talkTitle: 'When Neural Networks Learn to Dream',
    session: 'Session 01 // Cognitive Horizons',
    time: '10:30 AM',
    portraitUrl: '/assets/speaker1_portrait.jpg',
    depthUrl: '/assets/speaker1_depth.jpg',
    scale: 1.28,
    offsetY: -0.02,
    fbmIntensity: 1.0,
    accentColor: '#EB0028',
    bio: 'Pioneering brain-computer symbioses and ethical containment frameworks at the Frontier Intelligence Institute.',
  },
  {
    id: 'speaker-marcus',
    name: 'Marcus Vance',
    role: 'Synthetic Biologist & Futurist',
    talkTitle: 'Reprogramming the Organic Code',
    session: 'Session 02 // Living Technology',
    time: '01:15 PM',
    portraitUrl: '/assets/speaker2_portrait.jpg',
    depthUrl: '/assets/speaker2_depth.jpg',
    scale: 1.22,
    offsetY: -0.01,
    fbmIntensity: 0.95,
    accentColor: '#ff2b42',
    bio: 'Author of "Beyond DNA" and architect behind carbon-neutral self-healing bioceramics.',
  },
  {
    id: 'speaker-ravi',
    name: 'Ravi Klaassens',
    role: 'Creative Developer & Designer',
    talkTitle: 'The Craft of Digital Tension',
    session: 'Session 03 // The Human Interface',
    time: '03:45 PM',
    portraitUrl: '/assets/ravi_portrait.webp',
    depthUrl: '/assets/ravi_depth.png',
    scale: 1.25,
    offsetY: 0.0,
    fbmIntensity: 1.05,
    accentColor: '#EB0028',
    bio: 'Award-winning digital designer fusing WebGL shader architecture with visceral storytelling.',
  },
];

export const DEFAULT_SPEAKER_ID = 'speaker-maya';

export const EVENT_INFO = {
  name: 'TEDxFrontier',
  year: '2026',
  theme: 'RE:IMAGINE',
  subtitle: 'Ideas Worth Spreading',
  date: 'OCTOBER 24, 2026',
  location: 'Symphony Hall • Amsterdam',
  livestreamStatus: 'BROADCAST STANDBY',
  ticketUrl: '#tickets',
};
