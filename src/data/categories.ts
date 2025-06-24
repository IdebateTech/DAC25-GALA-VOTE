export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  nominees: string[];
  isAward?: boolean; // For awards without voting
}

export const categories: Category[] = [
  {
    id: 'mama-mekha',
    title: 'Mama Mekha Award',
    icon: '🥇',
    description: 'Lifetime Service Recognition - Special Award',
    nominees: [],
    isAward: true
  },
  {
    id: 'execution-excellence',
    title: 'Execution Excellence Award',
    icon: '⚡',
    description: 'Outstanding Project Implementation and Leadership',
    nominees: [
      'KALISA Danny',
      'Ornella TUZA',
      'Emma Victor',
      'Lucas SHEMA'
    ]
  },
  {
    id: 'best-coordinator',
    title: 'Best Camp Coordinator',
    icon: '🏕️',
    description: 'Based on camper feedback, leadership, and dedication',
    nominees: [
      'Ornella TUZA',
      'KALISA Danny',
      'Angelo URUKUNDO'
    ]
  },
  {
    id: 'top-venue',
    title: 'Top Host Venue',
    icon: '🏛️',
    description: 'Most welcoming venue with strong logistical support',
    nominees: [
      'New Life High School',
      'Hope Haven',
      'Gashora Girls Academy'
    ]
  },
  {
    id: 'volunteer-intake',
    title: 'Volunteer Intake of the Decade',
    icon: '🤝',
    description: 'Group that left a lasting mark through service and spirit',
    nominees: [
      'iVolunteer \'25',
      'iVolunteer \'24',
      'iVolunteer \'23',
      'iVolunteer \'22'
    ]
  },
  {
    id: 'mentor-decade',
    title: 'Mentor of the Decade',
    icon: '👨‍🏫',
    description: 'Known for creating winning teams and impacting students',
    nominees: [
      'Brenna AKARABO',
      'Shamila KAREMA',
      'Emma Victor',
      'Ruth JURU',
      'Queen KABANDANA',
      'Lucas SHEMA',
      'Bonfils RUKUNDO',
      'Joana BYUMVUHORE'
    ]
  },
  {
    id: 'afternoon-class',
    title: 'Best Afternoon Class',
    icon: '🎨',
    description: 'The most engaging and enjoyable experience for campers',
    nominees: [
      'Dance Class',
      'Creative Writing',
      'Multimedia',
      'Art Class',
      'Leveraging AI',
      'Leadership Nexus'
    ]
  },
  {
    id: 'partners-spotlight',
    title: 'The Partner\'s Spotlight',
    icon: '🤝',
    description: 'Organization that provided exceptional support and partnership',
    nominees: [
      'BK Foundation',
      'Mastercard Foundation',
      'JMU',
      'ALX'
    ]
  },
  {
    id: 'dreamer-decade',
    title: 'Dreamer of the Decade',
    icon: '💭',
    description: 'When you think of camp, who comes to mind?',
    nominees: []
  },
  {
    id: 'face-dreamers',
    title: 'Face of the Dreamers',
    icon: '👑',
    description: 'The person who best represents the spirit of Dreamers Academy',
    nominees: [
      'Kalisa Deborah',
      'Ruzindana Kessy',
      'Akarabo Katsey'
    ]
  },
  {
    id: 'hype-maker',
    title: 'Hype Maker of the Decade',
    icon: '🎉',
    description: 'The person who brought the most energy and excitement to camp',
    nominees: [
      'Kendy',
      'La Tasha',
      'Abi'
    ]
  },
  {
    id: 'involved-alumni',
    title: 'Most Involved Alumni',
    icon: '🔄',
    description: 'Alumni who consistently returned to support and mentor',
    nominees: []
  },
  {
    id: 'dream-creator',
    title: 'Dream Creator of the Decade',
    icon: '✨',
    description: 'The visionary who helped shape and create the dream',
    nominees: []
  }
];