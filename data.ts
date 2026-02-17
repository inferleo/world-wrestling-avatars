
export interface Wrestler {
  id: string;
  name: string;
  slug: string;
  image: string;
  tagline: string;
  category: 'Male' | 'Female' | 'Legend';
  bio: string;
  stats: {
    strength: number;
    agility: number;
    technique: number;
    charisma: number;
  };
}

export interface AwardCategory {
  id: string;
  title: string;
  candidates: Wrestler[];
}

export const WRESTLERS: Wrestler[] = [
  {
    id: '1',
    name: 'Titan Rex',
    slug: 'titan-rex',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop',
    tagline: 'The Unstoppable Force',
    category: 'Male',
    bio: 'Standing at 6\'8" and weighing 285 lbs, Titan Rex is a force of nature. Known for his devastating powerbomb, he has dominated the heavyweight division for over a decade.',
    stats: { strength: 95, agility: 60, technique: 75, charisma: 90 }
  },
  {
    id: '2',
    name: 'Viper Queen',
    slug: 'viper-queen',
    image: 'https://images.unsplash.com/photo-1623945202659-173663b65261?q=80&w=2070&auto=format&fit=crop',
    tagline: 'Strike First, Strike Hard',
    category: 'Female',
    bio: 'Fast, lethal, and cunning. The Viper Queen uses her high-flying lucha libre style combined with submission mastery to neutralize any opponent.',
    stats: { strength: 65, agility: 95, technique: 90, charisma: 85 }
  },
  {
    id: '3',
    name: 'Iron Clad',
    slug: 'iron-clad',
    image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
    tagline: 'The Living Fortress',
    category: 'Male',
    bio: 'A defensive mastermind who wears his opponents down with grueling holds and unshakable resilience. Iron Clad has never tapped out.',
    stats: { strength: 88, agility: 55, technique: 92, charisma: 70 }
  },
  {
    id: '4',
    name: 'Golden Era',
    slug: 'golden-era',
    image: 'https://images.unsplash.com/photo-1579970979878-620242273e97?q=80&w=2070&auto=format&fit=crop',
    tagline: 'Old School Cool',
    category: 'Legend',
    bio: 'A throwback to the golden age of wrestling. With technicolor robes and a classic moveset, he reminds everyone why they fell in love with the sport.',
    stats: { strength: 80, agility: 70, technique: 95, charisma: 98 }
  }
];

export const AWARDS: AwardCategory[] = [
  {
    id: 'wrestler-of-the-year',
    title: 'Wrestler of the Year',
    candidates: WRESTLERS
  },
  {
    id: 'match-of-the-year',
    title: 'Match of the Year',
    candidates: [WRESTLERS[0], WRESTLERS[2]] // Example: Titan Rex vs Iron Clad
  }
];
