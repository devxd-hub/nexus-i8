/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Container } from '../components/primitives/Container.tsx';
import { SectionLabel } from '../components/primitives/SectionLabel.tsx';
import { PrimaryButton } from '../components/primitives/Button.tsx';
import { NexusIcon } from '../components/brand/NexusLogo.tsx';
import { AppRoute, TeamMember } from '../types.ts';
import { TEAM_MEMBERS } from '../data/nexusData.ts';
import { LeadershipShowcase } from '../components/team/LeadershipShowcase.tsx';
import { HeadsShowcase } from '../components/team/HeadsShowcase.tsx';
import { CrewDirectory } from '../components/team/CrewDirectory.tsx';
import { MemberProfileOverlay } from '../components/team/MemberProfileOverlay.tsx';
import { TeamBackgroundAmbience } from '../components/team/TeamBackgroundAmbience.tsx';

interface TeamPageProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * ORIGINAL NEXUS TEAM PAGE
 * 
 * Clean, authoritative, and editorial:
 * 1. Team Hero Header with ambient architectural canvas
 * 2. Lead Crew Sequence (Coordinators: Manish Prakash)
 * 3. Advisory Crew Sequence (Mentors: Om Pandey)
 * 4. Heads Sequence (Head of Operations: Jitesh Raj, Head of Tech: Imtiaz Allam, Vice Head of Ops: Siba Prasand Panda)
 * 5. Crew Directory (Complete interactive member database with search, category filtering & focus)
 * 6. Member Profile Dossier Overlay
 * 7. Squad Collaboration CTA
 */
export const TeamPage: React.FC<TeamPageProps> = ({ onRouteChange }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Coordinators (Authentic dataset)
  const coordinators: TeamMember[] = [
    TEAM_MEMBERS.find((m) => m.id === 'team-coord-01') || {
      id: 'team-coord-01',
      name: 'MANISH PRAKASH',
      role: 'COORDINATOR',
      group: 'COORDINATOR & MENTOR',
      discipline: 'Studio Operations & Program Coordination',
      yearOfStudy: 'Coordinator',
      bio: 'Coordinates studio operations, event logistics, and multidisciplinary project sprints across NEXUS squads.',
      imageUrl: '/images/team/manish-prakash-coordinator.webp',
      imagePosition: 'center 20%',
    },
  ];

  // Mentors (Authentic dataset)
  const mentors: TeamMember[] = [
    TEAM_MEMBERS.find((m) => m.id === 'team-mentor-01') || {
      id: 'team-mentor-01',
      name: 'OM PANDEY',
      role: 'MENTOR',
      group: 'COORDINATOR & MENTOR',
      discipline: 'Systems Architecture & Creative Mentorship',
      yearOfStudy: 'Mentor',
      bio: 'Mentors squad members on design engineering, technical problem-solving, and professional project execution.',
      imageUrl: '/images/team/om-pandey.webp',
      imagePosition: 'center 22%',
    },
  ];

  // Studio Heads (Operations & Tech)
  const heads: TeamMember[] = [
    TEAM_MEMBERS.find((m) => m.id === 'team-coord-03') || {
      id: 'team-coord-03',
      name: 'JITESH RAJ',
      role: 'HEAD OF OPERATIONS, NEXUS',
      group: 'HEADS',
      discipline: 'Operations & Studio Leadership',
      yearOfStudy: 'Lead // 2026',
      bio: 'Directs strategic operations, project lifecycle governance, and squad orchestration across NEXUS.',
      imageUrl: '/images/team/jitesh_bhaiya.webp',
      alternateImageUrl: '/images/team/jitesh_bhaiya.jpeg',
      imagePosition: 'center 36%',
    },
    TEAM_MEMBERS.find((m) => m.id === 'team-head-02') || {
      id: 'team-head-02',
      name: 'IMTIAZ ALLAM',
      role: 'HEAD OF TECH',
      group: 'HEADS',
      discipline: 'Technical Architecture & Systems Engineering',
      yearOfStudy: 'Lead // 2026',
      bio: 'Leads technical infrastructure, software architecture, and engineering sprints across NEXUS projects.',
      imageUrl: '/images/team/Imtiaz_Allam.jpeg',
      imagePosition: 'center 25%',
    },
    TEAM_MEMBERS.find((m) => m.id === 'team-coord-02') || {
      id: 'team-coord-02',
      name: 'SIBA PRASAND PANDA',
      role: 'VICE HEAD OF OPS',
      group: 'HEADS',
      discipline: 'Studio Operations & Program Coordination',
      yearOfStudy: 'Lead // 2026',
      bio: 'Oversees operational logistics, squad workflows, resource coordination, and cross-team execution across NEXUS.',
      imageUrl: '/images/team/siba-hoops.webp',
      alternateImageUrl: '/images/team/siba-hoops.png',
      imagePosition: 'center 20%',
    },
  ];

  return (
    <main
      id="nexus-team-page"
      className="relative w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden selection:bg-[#F2613F] selection:text-[var(--bg-primary)] flex flex-col"
    >
      {/* ========================================================================= */}
      {/* 01. EDITORIAL TEAM HERO HEADER                                            */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] py-24 sm:py-32 flex items-center justify-center border-b border-[var(--border-subtle)] overflow-hidden">
        {/* Ambient Canvas Background */}
        <TeamBackgroundAmbience />

        <Container>
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center">
              <SectionLabel number="00" label="SQUAD &amp; COMMUNITY" />
            </div>

            <motion.h1
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-fraunces font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[var(--text-primary)] tracking-tight leading-[0.95] uppercase"
            >
              THE TEAM
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-dosis font-bold text-xs sm:text-sm tracking-[0.3em] text-[#F2613F] uppercase max-w-xl mx-auto"
            >
              THE PEOPLE WHO MAKE IT HAPPEN
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pt-4 flex items-center justify-center gap-3 text-xs font-dosis font-medium tracking-[0.2em] text-[var(--text-muted)] uppercase"
            >
              <span>{TEAM_MEMBERS.length} CREW MEMBERS</span>
              <span>•</span>
              <span>4 DISCIPLINES</span>
              <span>•</span>
              <span>ITERATION 2026</span>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 01. LEADERSHIP & ADVISORY (COORDINATOR & MENTOR)                          */}
      {/* ========================================================================= */}
      <LeadershipShowcase
        id="leadership-showcase"
        coordinators={coordinators}
        mentors={mentors}
        onSelectMember={setSelectedMember}
      />

      {/* ========================================================================= */}
      {/* 02. STUDIO HEADS (OPERATIONS & TECH HEADS)                                */}
      {/* ========================================================================= */}
      <HeadsShowcase
        id="heads-showcase"
        heads={heads}
        onSelectMember={setSelectedMember}
      />

      {/* ========================================================================= */}
      {/* 03. COMPLETE CREW DIRECTORY                                               */}
      {/* ========================================================================= */}
      <CrewDirectory
        id="crew-directory"
        members={TEAM_MEMBERS}
        onSelectMember={setSelectedMember}
        sectionNumber="03"
      />

      {/* ========================================================================= */}
      {/* 04. COLLABORATION CTA                                                     */}
      {/* ========================================================================= */}
      <section className="relative w-full py-20 sm:py-28 bg-[var(--bg-primary)] text-[var(--text-primary)] border-t border-[var(--border-subtle)]">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <SectionLabel number="04" label="CONNECT" />
            <h2 className="font-fraunces font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] uppercase tracking-tight">
              COLLABORATE WITH NEXUS
            </h2>
            <p className="font-bitter text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Interested in collaborating on research sprints, physical computing tools, or publication features?
            </p>
            <div className="pt-2">
              <PrimaryButton
                label="GET IN TOUCH"
                onClick={() => onRouteChange('/contact')}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 06. MEMBER PROFILE OVERLAY DOSSIER                                        */}
      {/* ========================================================================= */}
      <MemberProfileOverlay
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </main>
  );
};
