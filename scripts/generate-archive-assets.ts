/**
 * Script to generate high-end editorial SVG visual assets for the NEXUS MorphSlider Archive.
 * Uses warm paper tones (#F4EFE6, #EAE3D5), deep charcoal (#151413), warm timber (#5C4E43),
 * and NEXUS Orange (#EF5A2A) accents with fine technical annotations and textural detail.
 */
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'public/images/nexus/archive');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 01: IDEATE / OPEN STUDIO
const svg01 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <radialGradient id="vignette01" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#FAF6EE"/>
      <stop offset="60%" stop-color="#EFE8DA"/>
      <stop offset="100%" stop-color="#DFD5C3"/>
    </radialGradient>
    <linearGradient id="woodGrad01" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9CEBC"/>
      <stop offset="50%" stop-color="#CBBFA9"/>
      <stop offset="100%" stop-color="#BDB09A"/>
    </linearGradient>
    <pattern id="grid01" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0A0A09" stroke-width="0.5" stroke-opacity="0.08"/>
      <circle cx="0" cy="0" r="1" fill="#EF5A2A" fill-opacity="0.3"/>
    </pattern>
    <pattern id="dots01" width="15" height="15" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.75" fill="#151413" fill-opacity="0.12"/>
    </pattern>
    <filter id="paperNoise01">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0"/>
      <feComposite in2="SourceGraphic" in="gl" operator="in"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="900" fill="url(#vignette01)"/>
  <rect width="1200" height="900" fill="url(#grid01)"/>
  
  <!-- Drafting Table Plane -->
  <rect x="80" y="80" width="1040" height="740" rx="4" fill="#F8F4EC" stroke="#151413" stroke-width="1.5" stroke-opacity="0.25"/>
  <rect x="95" y="95" width="1010" height="710" fill="url(#dots01)"/>

  <!-- Left Drafting Sheet: System Architecture -->
  <g transform="translate(140, 150) rotate(-2)">
    <rect width="440" height="580" fill="#FCFAF5" stroke="#151413" stroke-width="1" filter="drop-shadow(0 8px 16px rgba(10,10,9,0.08))"/>
    <!-- Technical header -->
    <text x="30" y="45" font-family="monospace" font-size="11" font-weight="bold" fill="#EF5A2A" letter-spacing="2">NEXUS / SPEC.01 // SYSTEM IDEATION</text>
    <text x="30" y="65" font-family="serif" font-size="18" font-weight="bold" fill="#151413">Multi-Node Sensory Array</text>
    <line x1="30" y1="80" x2="410" y2="80" stroke="#151413" stroke-width="0.75" stroke-opacity="0.3"/>
    
    <!-- Isometric diagrams -->
    <path d="M 120 180 L 220 120 L 320 180 L 220 240 Z" fill="none" stroke="#151413" stroke-width="1.5"/>
    <path d="M 120 180 L 120 280 L 220 340 L 220 240 Z" fill="#EFE8DA" fill-opacity="0.6" stroke="#151413" stroke-width="1.5"/>
    <path d="M 320 180 L 320 280 L 220 340 L 220 240 Z" fill="#E5DCB7" fill-opacity="0.4" stroke="#151413" stroke-width="1.5"/>
    
    <!-- Flow vectors & Orange annotations -->
    <path d="M 220 120 L 220 60" stroke="#EF5A2A" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="220" cy="60" r="4" fill="#EF5A2A"/>
    <text x="235" y="65" font-family="monospace" font-size="10" fill="#EF5A2A">NODE_PRIMARY (INPUT)</text>

    <path d="M 320 280 L 370 320" stroke="#EF5A2A" stroke-width="1.5"/>
    <circle cx="370" cy="320" r="4" fill="#EF5A2A"/>
    <text x="380" y="325" font-family="monospace" font-size="9" fill="#151413">TOLERANCE ±0.05mm</text>

    <!-- Schematic text blocks -->
    <line x1="30" y1="390" x2="250" y2="390" stroke="#151413" stroke-width="1" stroke-opacity="0.4"/>
    <line x1="30" y1="410" x2="380" y2="410" stroke="#151413" stroke-width="0.75" stroke-opacity="0.2"/>
    <line x1="30" y1="425" x2="360" y2="425" stroke="#151413" stroke-width="0.75" stroke-opacity="0.2"/>
    <line x1="30" y1="440" x2="310" y2="440" stroke="#151413" stroke-width="0.75" stroke-opacity="0.2"/>
    <line x1="30" y1="455" x2="390" y2="455" stroke="#151413" stroke-width="0.75" stroke-opacity="0.2"/>

    <rect x="30" y="490" width="140" height="50" fill="none" stroke="#EF5A2A" stroke-width="1"/>
    <text x="40" y="510" font-family="monospace" font-size="9" fill="#EF5A2A">VALIDATION STATE</text>
    <text x="40" y="528" font-family="monospace" font-size="12" font-weight="bold" fill="#151413">PASS // STAGE 1</text>
  </g>

  <!-- Right Layered Sketches & Prototypes Plan -->
  <g transform="translate(610, 130) rotate(3)">
    <rect width="460" height="600" fill="#FAF6EE" stroke="#151413" stroke-width="1" filter="drop-shadow(0 10px 20px rgba(10,10,9,0.1))"/>
    <text x="35" y="45" font-family="monospace" font-size="11" font-weight="bold" fill="#151413" letter-spacing="2">COLLABORATIVE WIREFRAME</text>
    <text x="35" y="65" font-family="serif" font-size="16" font-style="italic" fill="#66615A">Cross-Disciplinary Iteration Session</text>
    
    <!-- Circle & geometric construction -->
    <circle cx="230" cy="240" r="120" fill="none" stroke="#151413" stroke-width="1.2" stroke-opacity="0.4"/>
    <circle cx="230" cy="240" r="80" fill="#EF5A2A" fill-opacity="0.06" stroke="#EF5A2A" stroke-width="1.5"/>
    <circle cx="230" cy="240" r="40" fill="none" stroke="#151413" stroke-width="0.8" stroke-dasharray="3,3"/>
    
    <!-- Radial rays -->
    <line x1="230" y1="120" x2="230" y2="360" stroke="#151413" stroke-width="0.75" stroke-opacity="0.3"/>
    <line x1="110" y1="240" x2="350" y2="240" stroke="#151413" stroke-width="0.75" stroke-opacity="0.3"/>
    <line x1="145" y1="155" x2="315" y2="325" stroke="#EF5A2A" stroke-width="1" stroke-opacity="0.7"/>

    <!-- Handwritten-style notes -->
    <text x="60" y="410" font-family="sans-serif" font-size="12" font-weight="500" fill="#151413">"Structure balances kinetic load with human-scale feedback"</text>
    <text x="60" y="430" font-family="sans-serif" font-size="11" fill="#66615A">— Team Mechanical &amp; UX Collective</text>

    <!-- Mini chart -->
    <g transform="translate(60, 460)">
      <rect width="340" height="85" fill="#EFE8DC" rx="2"/>
      <path d="M 20 65 L 70 50 L 130 58 L 190 30 L 250 38 L 310 15" fill="none" stroke="#EF5A2A" stroke-width="2.5"/>
      <circle cx="190" cy="30" r="4" fill="#151413"/>
      <circle cx="310" cy="15" r="4" fill="#EF5A2A"/>
      <text x="20" y="20" font-family="monospace" font-size="9" fill="#151413">RESONANCE PEAK // 4.8 kHz</text>
    </g>
  </g>

  <!-- Physical Drafting Tools (Ruler & Compass overlay) -->
  <g transform="translate(100, 700) rotate(-6)">
    <!-- Steel Ruler -->
    <rect width="480" height="34" fill="#E2DDD5" stroke="#151413" stroke-width="1"/>
    <line x1="0" y1="17" x2="480" y2="17" stroke="#151413" stroke-width="0.5" stroke-opacity="0.3"/>
    <!-- Ruler ticks -->
    <path d="M 20 0 L 20 12 M 40 0 L 40 8 M 60 0 L 60 12 M 80 0 L 80 8 M 100 0 L 100 14 M 120 0 L 120 8 M 140 0 L 140 12 M 160 0 L 160 8 M 180 0 L 180 12 M 200 0 L 200 14 M 220 0 L 220 8 M 240 0 L 240 12 M 260 0 L 260 8 M 280 0 L 280 12 M 300 0 L 300 14 M 320 0 L 320 8 M 340 0 L 340 12 M 360 0 L 360 8 M 380 0 L 380 12 M 400 0 L 400 14 M 420 0 L 420 8 M 440 0 L 440 12 M 460 0 L 460 8" stroke="#151413" stroke-width="0.8"/>
    <text x="95" y="27" font-family="monospace" font-size="8" fill="#151413">10cm</text>
    <text x="195" y="27" font-family="monospace" font-size="8" fill="#151413">20cm</text>
    <text x="295" y="27" font-family="monospace" font-size="8" fill="#151413">30cm</text>
    <text x="395" y="27" font-family="monospace" font-size="8" fill="#151413">40cm</text>
  </g>

  <!-- Editorial Stamps & Seal -->
  <g transform="translate(1000, 710)">
    <circle cx="35" cy="35" r="32" fill="none" stroke="#EF5A2A" stroke-width="1.5" stroke-dasharray="5,2"/>
    <text x="35" y="32" font-family="monospace" font-size="8" font-weight="bold" fill="#EF5A2A" text-anchor="middle">NEXUS</text>
    <text x="35" y="44" font-family="monospace" font-size="7" fill="#EF5A2A" text-anchor="middle">ARCHIVE 01</text>
  </g>
</svg>`;

// 02: BUILD / PHYSICAL PROTOTYPING
const svg02 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <radialGradient id="vignette02" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#EBE4D6"/>
      <stop offset="60%" stop-color="#DFD5C2"/>
      <stop offset="100%" stop-color="#CDC1AA"/>
    </radialGradient>
    <pattern id="pcbGrid02" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#151413" stroke-width="0.4" stroke-opacity="0.1"/>
      <circle cx="12" cy="12" r="1.2" fill="#EF5A2A" fill-opacity="0.25"/>
    </pattern>
  </defs>

  <!-- Base Studio Workbench -->
  <rect width="1200" height="900" fill="url(#vignette02)"/>
  <rect width="1200" height="900" fill="url(#pcbGrid02)"/>

  <!-- Antistatic Mat Plane -->
  <rect x="100" y="80" width="1000" height="740" rx="6" fill="#1F2321" stroke="#151413" stroke-width="2"/>
  <rect x="120" y="100" width="960" height="700" fill="#242B28" stroke="#37433E" stroke-width="1"/>

  <!-- Mat Markings -->
  <g opacity="0.35">
    <path d="M 120 450 L 1080 450 M 600 100 L 600 800" stroke="#FAF6EE" stroke-width="0.75" stroke-dasharray="6,6"/>
    <circle cx="600" cy="450" r="180" fill="none" stroke="#FAF6EE" stroke-width="0.75"/>
    <circle cx="600" cy="450" r="260" fill="none" stroke="#FAF6EE" stroke-width="0.5"/>
    <text x="140" y="130" font-family="monospace" font-size="10" fill="#FAF6EE">ANTISTATIC WORKSTATION // REF. NX-PROT-02</text>
  </g>

  <!-- Main Hardware Prototype (Custom Matte Board & Circuitry) -->
  <g transform="translate(260, 200)">
    <!-- Circuit Substrate Base -->
    <rect width="680" height="500" rx="8" fill="#151917" stroke="#3D4944" stroke-width="1.5" filter="drop-shadow(0 20px 30px rgba(0,0,0,0.5))"/>
    
    <!-- Copper traces / bus lines -->
    <g stroke="#C59B63" stroke-width="1.8" fill="none" opacity="0.85">
      <path d="M 60 80 L 180 80 L 220 120 L 320 120"/>
      <path d="M 60 100 L 170 100 L 210 140 L 320 140"/>
      <path d="M 60 120 L 160 120 L 200 160 L 320 160"/>
      
      <path d="M 480 120 L 560 120 L 600 160 L 600 280"/>
      <path d="M 480 140 L 550 140 L 580 170 L 580 280"/>
      
      <path d="M 180 420 L 260 340 L 420 340 L 460 380 L 580 380"/>
      <path d="M 180 440 L 250 360 L 410 360 L 450 400 L 580 400"/>
    </g>

    <!-- NEXUS Orange Data Busses -->
    <g stroke="#EF5A2A" stroke-width="2.2" fill="none">
      <path d="M 320 220 L 220 220 L 160 280 L 160 380"/>
      <circle cx="160" cy="380" r="4" fill="#EF5A2A"/>
      <circle cx="320" cy="220" r="4" fill="#EF5A2A"/>

      <path d="M 480 220 L 560 220 L 600 260 L 600 360"/>
      <circle cx="600" cy="360" r="4" fill="#EF5A2A"/>
      <circle cx="480" cy="220" r="4" fill="#EF5A2A"/>
    </g>

    <!-- Central Microcontroller Module (NEXUS CORE) -->
    <rect x="320" y="140" width="160" height="160" rx="4" fill="#0C0E0D" stroke="#EF5A2A" stroke-width="2"/>
    <rect x="340" y="160" width="120" height="120" rx="2" fill="#151413" stroke="#333" stroke-width="1"/>
    
    <!-- Chip pins -->
    <g fill="#A8B2AA">
      <rect x="306" y="160" width="14" height="6"/><rect x="306" y="180" width="14" height="6"/>
      <rect x="306" y="200" width="14" height="6"/><rect x="306" y="220" width="14" height="6"/>
      <rect x="306" y="240" width="14" height="6"/><rect x="306" y="260" width="14" height="6"/>
      
      <rect x="480" y="160" width="14" height="6"/><rect x="480" y="180" width="14" height="6"/>
      <rect x="480" y="200" width="14" height="6"/><rect x="480" y="220" width="14" height="6"/>
      <rect x="480" y="240" width="14" height="6"/><rect x="480" y="260" width="14" height="6"/>
    </g>
    
    <text x="400" y="215" font-family="monospace" font-size="11" font-weight="bold" fill="#EF5A2A" text-anchor="middle">NEXUS</text>
    <text x="400" y="235" font-family="monospace" font-size="9" fill="#FAF6EE" text-anchor="middle">ARM-V8 // CORTEX</text>

    <!-- Tactile Switches & Knobs -->
    <circle cx="100" cy="180" r="22" fill="#3D4541" stroke="#EF5A2A" stroke-width="1.5"/>
    <circle cx="100" cy="180" r="14" fill="#151413"/>
    <line x1="100" y1="180" x2="110" y2="170" stroke="#EF5A2A" stroke-width="2"/>

    <circle cx="100" cy="260" r="22" fill="#3D4541" stroke="#A8B2AA" stroke-width="1"/>
    <circle cx="100" cy="260" r="14" fill="#151413"/>
    <line x1="100" y1="260" x2="95" y2="250" stroke="#A8B2AA" stroke-width="2"/>

    <!-- OLED Display Interface -->
    <rect x="220" y="360" width="240" height="90" rx="3" fill="#0A0C0B" stroke="#485A52" stroke-width="1.5"/>
    <text x="235" y="385" font-family="monospace" font-size="10" fill="#EF5A2A">&gt; SYSTEM STATUS: READY</text>
    <text x="235" y="405" font-family="monospace" font-size="9" fill="#7EE787">&gt; CLK: 120.0 MHz | SYNC: OK</text>
    <text x="235" y="425" font-family="monospace" font-size="9" fill="#8B949E">&gt; TELEMETRY PKT: 0x8F94B2</text>
    <path d="M 370 415 L 390 405 L 410 420 L 430 395 L 445 405" fill="none" stroke="#EF5A2A" stroke-width="1.5"/>
  </g>

  <!-- Braided Cables / Wires weaving across workbench -->
  <g fill="none" stroke-linecap="round">
    <path d="M 60 760 C 180 740, 240 680, 290 620" stroke="#EF5A2A" stroke-width="4.5"/>
    <path d="M 70 780 C 190 760, 250 700, 310 630" stroke="#FAF6EE" stroke-width="3" stroke-dasharray="8,4"/>
    <path d="M 50 740 C 170 720, 230 660, 270 600" stroke="#151413" stroke-width="4"/>
  </g>

  <!-- Workshop Label -->
  <g transform="translate(850, 740)">
    <rect width="210" height="42" fill="#F4EFE6" stroke="#151413" stroke-width="1"/>
    <text x="15" y="20" font-family="monospace" font-size="9" font-weight="bold" fill="#EF5A2A">HARDWARE SPRINT</text>
    <text x="15" y="34" font-family="monospace" font-size="8" fill="#151413">PHASE: PHYSICAL INTEGRATION</text>
  </g>
</svg>`;

// 03: COLLABORATION / WORKSHOP BENCH
const svg03 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <radialGradient id="vignette03" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#F8F3EA"/>
      <stop offset="65%" stop-color="#ECE3D2"/>
      <stop offset="100%" stop-color="#DCD0BD"/>
    </radialGradient>
    <pattern id="diag03" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="20" stroke="#151413" stroke-width="0.5" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <!-- Studio Table Ambient -->
  <rect width="1200" height="900" fill="url(#vignette03)"/>
  <rect width="1200" height="900" fill="url(#diag03)"/>

  <!-- Left: Laptop Workstation running Real-Time Generative Simulation -->
  <g transform="translate(120, 140) rotate(-4)">
    <!-- Screen Chassis -->
    <rect width="440" height="300" rx="10" fill="#181A1B" stroke="#33373B" stroke-width="2" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.15))"/>
    <!-- Screen Glass -->
    <rect x="15" y="15" width="410" height="270" rx="4" fill="#0A0C0E"/>
    
    <!-- Code / Visualizer Interface -->
    <text x="30" y="40" font-family="monospace" font-size="10" fill="#EF5A2A">● ● ●   nexus-engine // node_cluster.ts</text>
    
    <!-- Waveform & 3D mesh preview -->
    <path d="M 40 160 Q 90 80, 140 160 T 240 160 T 340 160 T 400 160" fill="none" stroke="#EF5A2A" stroke-width="2"/>
    <path d="M 40 175 Q 90 230, 140 175 T 240 175 T 340 175 T 400 175" fill="none" stroke="#FAF6EE" stroke-width="1.2" stroke-dasharray="4,4"/>

    <!-- Code lines -->
    <g fill="#A8B4A5" font-family="monospace" font-size="8">
      <text x="30" y="220"><tspan fill="#EF5A2A">const</tspan> collective = <tspan fill="#ECC06C">createNexusCluster</tspan>({</text>
      <text x="45" y="235">nodes: <tspan fill="#7EE787">['Design', 'Engineering', 'Media']</tspan>,</text>
      <text x="45" y="250">feedbackLoop: <tspan fill="#EF5A2A">true</tspan>, latency: <tspan fill="#ECC06C">0.4ms</tspan></text>
      <text x="30" y="265">});</text>
    </g>

    <!-- Laptop Base Keyboard Deck -->
    <path d="M -30 300 L 470 300 L 500 360 L -60 360 Z" fill="#2C2F33" stroke="#1A1C1E" stroke-width="1"/>
    <rect x="120" y="315" width="200" height="35" rx="3" fill="#1C1E20"/>
  </g>

  <!-- Right: Physical 3D Printed Spatial Rig & Mechanical Prototype -->
  <g transform="translate(620, 160) rotate(2)">
    <rect width="460" height="540" rx="6" fill="#FAF6EE" stroke="#151413" stroke-width="1" filter="drop-shadow(0 12px 24px rgba(10,10,9,0.08))"/>
    
    <text x="30" y="40" font-family="monospace" font-size="11" font-weight="bold" fill="#EF5A2A" letter-spacing="1.5">INTERDISCIPLINARY BENCH</text>
    <text x="30" y="60" font-family="serif" font-size="17" font-weight="bold" fill="#151413">Kinetic Joint &amp; Structural Housing</text>
    
    <!-- Geometric 3D Mechanical Assembly -->
    <g transform="translate(100, 100)">
      <!-- Main circular gear/housing -->
      <circle cx="130" cy="130" r="90" fill="#E8E0D0" stroke="#151413" stroke-width="2"/>
      <circle cx="130" cy="130" r="60" fill="#FAF6EE" stroke="#EF5A2A" stroke-width="2"/>
      <circle cx="130" cy="130" r="30" fill="#151413"/>
      <circle cx="130" cy="130" r="10" fill="#EF5A2A"/>

      <!-- Mechanical teeth -->
      <path d="M 130 30 L 130 40 M 130 220 L 130 230 M 30 130 L 40 130 M 220 130 L 230 130" stroke="#151413" stroke-width="3"/>
      <path d="M 60 60 L 68 68 M 200 200 L 192 192 M 60 200 L 68 192 M 200 60 L 192 68" stroke="#151413" stroke-width="3"/>

      <!-- Measurement callout lines -->
      <line x1="130" y1="20" x2="280" y2="20" stroke="#EF5A2A" stroke-width="1" stroke-dasharray="3,3"/>
      <text x="290" y="24" font-family="monospace" font-size="9" fill="#EF5A2A">Ø 180.0 mm</text>

      <line x1="230" y1="130" x2="280" y2="130" stroke="#151413" stroke-width="1"/>
      <text x="290" y="134" font-family="monospace" font-size="9" fill="#151413">TORQUE: 1.4 Nm</text>
    </g>

    <!-- Workshop collaboration log table -->
    <g transform="translate(30, 360)">
      <rect width="400" height="130" fill="#F0E9DC" rx="3" stroke="#151413" stroke-width="0.5"/>
      <text x="15" y="25" font-family="monospace" font-size="9" font-weight="bold" fill="#151413">COLLABORATOR LOG</text>
      <line x1="15" y1="35" x2="385" y2="35" stroke="#151413" stroke-width="0.5" stroke-opacity="0.3"/>
      
      <text x="15" y="55" font-family="monospace" font-size="9" fill="#66615A">01. Mech Team: Aluminum 6061 frame machined</text>
      <text x="15" y="75" font-family="monospace" font-size="9" fill="#66615A">02. Software: Bluetooth LE stream synced (30fps)</text>
      <text x="15" y="95" font-family="monospace" font-size="9" fill="#66615A">03. Design: Tactile ergonomics approved</text>
      <text x="15" y="115" font-family="monospace" font-size="9" font-weight="bold" fill="#EF5A2A">&gt;&gt; Ready for joint bench trial</text>
    </g>
  </g>

  <!-- Shared Workshop Notebook bottom left -->
  <g transform="translate(140, 520) rotate(3)">
    <rect width="360" height="260" rx="4" fill="#FDFBF7" stroke="#151413" stroke-width="1" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"/>
    <text x="25" y="35" font-family="serif" font-size="14" font-style="italic" fill="#151413">"Form follows the feedback loop."</text>
    <line x1="25" y1="50" x2="335" y2="50" stroke="#EF5A2A" stroke-width="1"/>
    
    <path d="M 30 110 Q 90 70, 150 110 T 270 110" fill="none" stroke="#151413" stroke-width="1.2"/>
    <circle cx="150" cy="110" r="4" fill="#EF5A2A"/>
    <text x="160" y="105" font-family="monospace" font-size="8" fill="#EF5A2A">DAMPING POINT</text>
    <text x="25" y="160" font-family="sans-serif" font-size="10" fill="#66615A">Exploration of tactile haptic resistance in response to sound amplitude.</text>
  </g>
</svg>`;

// 04: ITERATE / PRECISION LAB & CALIBRATION
const svg04 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <radialGradient id="vignette04" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#F4EEE4"/>
      <stop offset="60%" stop-color="#E7DEC9"/>
      <stop offset="100%" stop-color="#D5C7AF"/>
    </radialGradient>
    <pattern id="millimeterGrid04" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#151413" stroke-width="0.8" stroke-opacity="0.12"/>
      <path d="M 8 0 L 8 40 M 16 0 L 16 40 M 24 0 L 24 40 M 32 0 L 32 40" fill="none" stroke="#151413" stroke-width="0.3" stroke-opacity="0.06"/>
      <path d="M 0 8 L 40 8 M 0 16 L 40 16 M 0 24 L 40 24 M 0 32 L 40 32" fill="none" stroke="#151413" stroke-width="0.3" stroke-opacity="0.06"/>
    </pattern>
  </defs>

  <!-- Precision Lab Background -->
  <rect width="1200" height="900" fill="url(#vignette04)"/>
  <rect width="1200" height="900" fill="url(#millimeterGrid04)"/>

  <!-- Optical / Sensor Test Station -->
  <g transform="translate(160, 100)">
    <rect width="880" height="700" rx="6" fill="#FAF6EE" stroke="#151413" stroke-width="1.5" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.08))"/>
    
    <!-- Calibration Header -->
    <text x="40" y="45" font-family="monospace" font-size="11" font-weight="bold" fill="#EF5A2A" letter-spacing="2">PRECISION LAB // TEST RUN 04-B</text>
    <text x="40" y="70" font-family="serif" font-size="22" font-weight="bold" fill="#151413">Optical Alignment &amp; Tolerance Calibration</text>
    <line x1="40" y1="88" x2="840" y2="88" stroke="#151413" stroke-width="0.75" stroke-opacity="0.2"/>

    <!-- Central Oscilloscope / Calibration Graph -->
    <g transform="translate(40, 120)">
      <!-- Bezel -->
      <rect width="500" height="340" rx="4" fill="#141716" stroke="#2D3330" stroke-width="2"/>
      <!-- Grid -->
      <g stroke="#1F2824" stroke-width="0.8">
        <line x1="0" y1="85" x2="500" y2="85"/><line x1="0" y1="170" x2="500" y2="170"/><line x1="0" y1="255" x2="500" y2="255"/>
        <line x1="125" y1="0" x2="125" y2="340"/><line x1="250" y1="0" x2="250" y2="340"/><line x1="375" y1="0" x2="375" y2="340"/>
      </g>
      
      <!-- Primary Signal Trace (NEXUS Orange) -->
      <path d="M 20 170 C 60 170, 80 40, 125 170 C 170 300, 190 170, 250 170 C 310 170, 330 60, 375 170 C 420 280, 440 170, 480 170" fill="none" stroke="#EF5A2A" stroke-width="2.5"/>
      <!-- Reference Carrier (Green) -->
      <path d="M 20 170 C 50 120, 80 220, 125 170 C 170 120, 200 220, 250 170 C 300 120, 330 220, 375 170 C 420 120, 450 220, 480 170" fill="none" stroke="#48C774" stroke-width="1.2" stroke-dasharray="2,2"/>

      <text x="15" y="25" font-family="monospace" font-size="9" fill="#EF5A2A">CH1: 2.45 Vpp (ACTIVE)</text>
      <text x="15" y="40" font-family="monospace" font-size="9" fill="#48C774">CH2: 1.00 Vpp (REF CLK)</text>
      <text x="360" y="25" font-family="monospace" font-size="9" fill="#FAF6EE">THD &lt; 0.02%</text>
    </g>

    <!-- Vernier Calipers Overlay on the right -->
    <g transform="translate(570, 120)">
      <rect width="270" height="340" rx="3" fill="#EFE8DA" stroke="#151413" stroke-width="1"/>
      <text x="20" y="30" font-family="monospace" font-size="10" font-weight="bold" fill="#151413">METROLOGY LOG</text>
      <line x1="20" y1="40" x2="250" y2="40" stroke="#151413" stroke-width="0.5" stroke-opacity="0.3"/>

      <!-- Measurement entries -->
      <g font-family="monospace" font-size="9" fill="#151413">
        <text x="20" y="65">Point A (Bearing Seat):</text>
        <text x="20" y="80" font-weight="bold" fill="#EF5A2A">24.002 mm (NOMINAL)</text>
        
        <text x="20" y="110">Point B (Axial Runout):</text>
        <text x="20" y="125" font-weight="bold" fill="#151413">0.008 mm (PASS)</text>

        <text x="20" y="155">Point C (Thermal Drift):</text>
        <text x="20" y="170" font-weight="bold" fill="#EF5A2A">+0.015 mm @ 45°C</text>
      </g>

      <!-- Stamp -->
      <g transform="translate(40, 220)">
        <rect width="180" height="70" rx="2" fill="none" stroke="#EF5A2A" stroke-width="1.5"/>
        <text x="90" y="30" font-family="monospace" font-size="10" font-weight="bold" fill="#EF5A2A" text-anchor="middle">CALIBRATION CERTIFIED</text>
        <text x="90" y="48" font-family="monospace" font-size="8" fill="#151413" text-anchor="middle">NEXUS LABS // SPRINT 04</text>
      </g>
    </g>

    <!-- Bottom Dial & Fine Adjustment Controls -->
    <g transform="translate(40, 490)">
      <rect width="800" height="170" rx="4" fill="#F1ECE0" stroke="#151413" stroke-width="1"/>
      
      <!-- Rotary Encoders -->
      <g transform="translate(60, 40)">
        <circle cx="45" cy="45" r="35" fill="#242826" stroke="#EF5A2A" stroke-width="2"/>
        <circle cx="45" cy="45" r="24" fill="#151413"/>
        <line x1="45" y1="45" x2="65" y2="30" stroke="#EF5A2A" stroke-width="2.5"/>
        <text x="45" y="105" font-family="monospace" font-size="9" fill="#151413" text-anchor="middle">FINE TUNE</text>
      </g>

      <g transform="translate(200, 40)">
        <circle cx="45" cy="45" r="35" fill="#242826" stroke="#9AA39E" stroke-width="1"/>
        <circle cx="45" cy="45" r="24" fill="#151413"/>
        <line x1="45" y1="45" x2="35" y2="25" stroke="#FAF6EE" stroke-width="2"/>
        <text x="45" y="105" font-family="monospace" font-size="9" fill="#151413" text-anchor="middle">FREQUENCY</text>
      </g>

      <g transform="translate(340, 40)">
        <circle cx="45" cy="45" r="35" fill="#242826" stroke="#9AA39E" stroke-width="1"/>
        <circle cx="45" cy="45" r="24" fill="#151413"/>
        <line x1="45" y1="45" x2="60" y2="60" stroke="#FAF6EE" stroke-width="2"/>
        <text x="45" y="105" font-family="monospace" font-size="9" fill="#151413" text-anchor="middle">ATTENUATION</text>
      </g>

      <g transform="translate(480, 20)">
        <text x="20" y="30" font-family="monospace" font-size="10" font-weight="bold" fill="#151413">EXPERIMENTAL HYPOTHESIS:</text>
        <text x="20" y="55" font-family="sans-serif" font-size="11" fill="#66615A">"Reducing latency under 5ms yields human perception of instantaneous physical touch."</text>
        <text x="20" y="85" font-family="monospace" font-size="9" font-weight="bold" fill="#EF5A2A">&gt;&gt; VERIFIED IN SPRINT 04</text>
      </g>
    </g>
  </g>
</svg>`;

// 05: SHOWCASE / COMMUNITY DEMO & LIVE ARTIFACT
const svg05 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <radialGradient id="spotlight05" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FCF8F0"/>
      <stop offset="50%" stop-color="#EFE6D4"/>
      <stop offset="100%" stop-color="#D7C9AF"/>
    </radialGradient>
    <pattern id="galleryFloor05" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#151413" stroke-width="0.6" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <!-- Gallery Base Ambient -->
  <rect width="1200" height="900" fill="url(#spotlight05)"/>
  <rect width="1200" height="900" fill="url(#galleryFloor05)"/>

  <!-- Exhibition Pedestal & Showcase Presentation -->
  <g transform="translate(180, 120)">
    <!-- Main Exhibition Canvas -->
    <rect width="840" height="660" rx="8" fill="#FAF6EE" stroke="#151413" stroke-width="1.5" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.1))"/>
    
    <!-- Top Gallery Tag -->
    <g transform="translate(40, 40)">
      <rect width="130" height="24" fill="#EF5A2A"/>
      <text x="65" y="16" font-family="monospace" font-size="10" font-weight="bold" fill="#FAF6EE" text-anchor="middle">LIVE SHOWCASE</text>
      <text x="145" y="16" font-family="monospace" font-size="11" fill="#151413">NEXUS DEMO DAY // ARTIFACT 05</text>
    </g>

    <text x="40" y="105" font-family="serif" font-size="28" font-weight="bold" fill="#151413">The Integrated Collective Prototype</text>
    <text x="40" y="130" font-family="sans-serif" font-size="13" fill="#66615A">A functional synthesis of code, physical design, electronic circuits, and spatial interaction.</text>

    <!-- Central Hero Showcase Sculpture / Interactive Terminal -->
    <g transform="translate(120, 160)">
      <!-- Pedestal Stage -->
      <polygon points="60,260 540,260 480,380 0,380" fill="#E8DFCE" stroke="#151413" stroke-width="1.5"/>
      
      <!-- Levitating/Mounted Interactive Sculpture -->
      <g transform="translate(180, 30)">
        <!-- Outer Diamond Kinetic Ring -->
        <polygon points="120,0 240,120 120,240 0,120" fill="none" stroke="#151413" stroke-width="2.5"/>
        <polygon points="120,20 220,120 120,220 20,120" fill="#FAF6EE" stroke="#EF5A2A" stroke-width="1.5"/>
        
        <!-- Glowing Core Indicator -->
        <circle cx="120" cy="120" r="50" fill="#151413"/>
        <circle cx="120" cy="120" r="40" fill="#EF5A2A" fill-opacity="0.2"/>
        <circle cx="120" cy="120" r="25" fill="#EF5A2A"/>

        <!-- Ambient Energy / Optical Rays -->
        <line x1="120" y1="0" x2="120" y2="-30" stroke="#EF5A2A" stroke-width="2"/>
        <line x1="240" y1="120" x2="270" y2="120" stroke="#EF5A2A" stroke-width="2"/>
        <line x1="120" y1="240" x2="120" y2="270" stroke="#EF5A2A" stroke-width="2"/>
        <line x1="0" y1="120" x2="-30" y2="120" stroke="#EF5A2A" stroke-width="2"/>
      </g>
    </g>

    <!-- Exhibition Plaque bottom left -->
    <g transform="translate(40, 500)">
      <rect width="360" height="120" rx="3" fill="#EFE8DA" stroke="#151413" stroke-width="1"/>
      <text x="20" y="30" font-family="monospace" font-size="10" font-weight="bold" fill="#EF5A2A">CONTRIBUTORS &amp; DISCIPLINES</text>
      <line x1="20" y1="40" x2="340" y2="40" stroke="#151413" stroke-width="0.5" stroke-opacity="0.3"/>
      
      <text x="20" y="60" font-family="sans-serif" font-size="11" fill="#151413">• Computer Science: Distributed Synchronization</text>
      <text x="20" y="80" font-family="sans-serif" font-size="11" fill="#151413">• Industrial Design: Haptic Form &amp; Chassis</text>
      <text x="20" y="100" font-family="sans-serif" font-size="11" fill="#151413">• Electrical Eng: High-Speed Embedded Bus</text>
    </g>

    <!-- Community Quote bottom right -->
    <g transform="translate(440, 500)">
      <rect width="360" height="120" rx="3" fill="#FAF6EE" stroke="#EF5A2A" stroke-width="1"/>
      <text x="25" y="35" font-family="serif" font-size="13" font-style="italic" fill="#151413">"Ideas alone are mere potential. Together, they become tangible realities that shift perspective."</text>
      <text x="25" y="95" font-family="monospace" font-size="9" font-weight="bold" fill="#EF5A2A">— NEXUS COLLECTIVE SPRINT 2026</text>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, '01-ideas-sketches.svg'), svg01.trim());
fs.writeFileSync(path.join(outDir, '02-physical-prototype.svg'), svg02.trim());
fs.writeFileSync(path.join(outDir, '03-team-workshop.svg'), svg03.trim());
fs.writeFileSync(path.join(outDir, '04-iteration-detail.svg'), svg04.trim());
fs.writeFileSync(path.join(outDir, '05-studio-showcase.svg'), svg05.trim());

console.log('Successfully generated 5 high-end NEXUS Archive SVG assets in /public/images/nexus/archive/');
