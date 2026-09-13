export interface CardPositionConfig {
  strapHeight: number; // in px, e.g. 80 - 180
  rotation: number;    // in degrees, e.g. -1.2 to +1.2
  offsetY: number;     // in px, e.g. -12 to +14
  delay: number;       // in seconds
  row: 'top' | 'bottom';
  slotIndex: number;
}

export interface MemberSocials {
  github?: string;
  twitter?: string;
  website?: string;
  papers?: string;
}

export interface TeamMember {
  id: string; // e.g. "NX-001"
  slug: string; // canonical route slug, e.g. "maya-lin-svan"
  name: string;
  designation: string;
  role?: string; // canonical role alias (maps to corePillar/designation)
  department: 'ENGINEERING' | 'DESIGN' | 'RESEARCH';
  corePillar: string;
  clearanceLevel: string;
  image: string;
  photo: string; // canonical photo URL / path
  bio?: string; // canonical bio alias (maps to shortBio)
  shortBio?: string;
  message: string;
  whyNexus: string;
  specialWord: string; // unique kind special word (one word, e.g. "VISIONARY", "KINDNESS")
  quote: string; // canonical personal quote / ethos
  currentFocus: string;
  focus: string; // canonical active focus
  funFact: string;
  qrUrl: string; // canonical profile URL, e.g. "/team/maya-lin-svan"
  nodeLocation: string;
  frequency: string;
  securityZone: string;
  badgeIssue: string;
  skills: string[];
  socials: MemberSocials;
  positioning: CardPositionConfig;
}

export type DepartmentFilter = 'ALL' | 'ENGINEERING' | 'DESIGN' | 'RESEARCH';
