// Shared visual vocabulary for the pet scene - the same render functions back
// both the small shop preview swatches and the full-size scene behind the
// pet, so there's one set of art assets, not two.
import type { ReactNode } from 'react';

export type SceneAsset = {
  name: string;
  render: () => ReactNode;
};

export const BACKGROUNDS: Record<string, SceneAsset> = {
  meadow: {
    name: 'Meadow',
    render: () => (
      <>
        <defs>
          <linearGradient id="bg-meadow-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dff3ea" />
            <stop offset="100%" stopColor="#eef6e0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="220" fill="url(#bg-meadow-sky)" />
        <circle cx="168" cy="30" r="16" fill="#fff3b0" opacity="0.8" />
        <path d="M0 190 Q50 165 100 185 T200 180 L200 220 L0 220 Z" fill="#cfe8b0" />
      </>
    ),
  },
  sunset: {
    name: 'Sunset Sky',
    render: () => (
      <>
        <defs>
          <linearGradient id="bg-sunset-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6a4c93" />
            <stop offset="50%" stopColor="#e8734a" />
            <stop offset="100%" stopColor="#f7c873" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="220" fill="url(#bg-sunset-sky)" />
        <circle cx="100" cy="150" r="30" fill="#ffe1a8" opacity="0.9" />
        <path d="M0 195 Q50 175 100 192 T200 188 L200 220 L0 220 Z" fill="#4d3350" />
      </>
    ),
  },
  night: {
    name: 'Starry Night',
    render: () => (
      <>
        <defs>
          <linearGradient id="bg-night-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a40" />
            <stop offset="100%" stopColor="#33356b" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="220" fill="url(#bg-night-sky)" />
        <circle cx="150" cy="35" r="14" fill="#f3f1d8" />
        <g fill="#fff7dc">
          <circle cx="30" cy="40" r="1.6" />
          <circle cx="55" cy="70" r="1.3" />
          <circle cx="20" cy="90" r="1.6" />
          <circle cx="170" cy="80" r="1.4" />
          <circle cx="120" cy="30" r="1.4" />
          <circle cx="90" cy="55" r="1.6" />
        </g>
        <path d="M0 198 Q50 180 100 196 T200 192 L200 220 L0 220 Z" fill="#20204a" />
      </>
    ),
  },
  beach: {
    name: 'Beach',
    render: () => (
      <>
        <defs>
          <linearGradient id="bg-beach-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fd9f0" />
            <stop offset="100%" stopColor="#fdf0c9" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="220" fill="url(#bg-beach-sky)" />
        <circle cx="40" cy="35" r="18" fill="#fff6d8" opacity="0.9" />
        <path d="M0 175 Q50 160 100 172 T200 168 L200 220 L0 220 Z" fill="#5ab7d6" opacity="0.55" />
        <path d="M0 195 Q50 182 100 192 T200 188 L200 220 L0 220 Z" fill="#f2e0ad" />
      </>
    ),
  },
  forest: {
    name: 'Forest',
    render: () => (
      <>
        <defs>
          <linearGradient id="bg-forest-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfe8c0" />
            <stop offset="100%" stopColor="#7fae6a" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="220" fill="url(#bg-forest-sky)" />
        <path d="M20 190 L35 140 L50 190 Z" fill="#2f5233" />
        <path d="M45 195 L62 130 L79 195 Z" fill="#3a6b3f" />
        <path d="M140 195 L157 130 L174 195 Z" fill="#3a6b3f" />
        <path d="M165 190 L180 145 L195 190 Z" fill="#2f5233" />
        <path d="M0 195 Q50 180 100 190 T200 186 L200 220 L0 220 Z" fill="#355e2e" />
      </>
    ),
  },
  space: {
    name: 'Outer Space',
    render: () => (
      <>
        <defs>
          <linearGradient id="bg-space-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b0b2e" />
            <stop offset="100%" stopColor="#3a2a5c" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="220" fill="url(#bg-space-sky)" />
        <circle cx="150" cy="55" r="20" fill="#d98b5f" />
        <ellipse
          cx="150"
          cy="55"
          rx="32"
          ry="7"
          fill="none"
          stroke="#f2c48a"
          strokeWidth="3"
          opacity="0.8"
          transform="rotate(-15 150 55)"
        />
        <g fill="#e8e6ff">
          <circle cx="30" cy="30" r="1.6" />
          <circle cx="55" cy="65" r="1.3" />
          <circle cx="20" cy="90" r="1.6" />
          <circle cx="80" cy="40" r="1.4" />
          <circle cx="100" cy="20" r="1.6" />
          <circle cx="60" cy="100" r="1.3" />
        </g>
        <path d="M0 200 Q50 185 100 195 T200 190 L200 220 L0 220 Z" fill="#1c1440" />
      </>
    ),
  },
};

export const FURNITURE: Record<string, SceneAsset> = {
  plant: {
    name: 'Potted Plant',
    render: () => (
      <g>
        <path d="M18 200 L34 200 L31 182 L21 182 Z" fill="#a6633c" />
        <ellipse cx="26" cy="182" rx="9" ry="3" fill="#8a5030" />
        <circle cx="26" cy="168" r="11" fill="#4c8038" />
        <circle cx="16" cy="176" r="8" fill="#5f9e48" />
        <circle cx="36" cy="176" r="8" fill="#5f9e48" />
      </g>
    ),
  },
  rug: {
    name: 'Cozy Rug',
    render: () => (
      <g opacity="0.9">
        <ellipse cx="100" cy="206" rx="70" ry="12" fill="#e0785a" />
        <ellipse cx="100" cy="206" rx="52" ry="8.5" fill="none" stroke="#fbe1c6" strokeWidth="2.5" />
      </g>
    ),
  },
  lamp: {
    name: 'Little Lamp',
    render: () => (
      <g>
        <rect x="171" y="150" width="4" height="48" fill="#7a6a55" />
        <ellipse cx="173" cy="198" rx="12" ry="4" fill="#5c4f3e" />
        <path d="M158 150 L188 150 L182 132 L164 132 Z" fill="#ffdd8a" />
        <circle cx="173" cy="150" r="18" fill="#fff3c4" opacity="0.5" />
      </g>
    ),
  },
  bookshelf: {
    name: 'Bookshelf',
    render: () => (
      <g>
        <rect x="6" y="53" width="42" height="4" rx="2" fill="#6b4a30" />
        <rect x="11" y="28" width="7" height="25" fill="#d9534f" />
        <rect x="19" y="22" width="7" height="31" fill="#4a90d9" />
        <rect x="27" y="30" width="7" height="23" fill="#f0c419" />
        <rect x="35" y="26" width="7" height="27" fill="#5cb85c" />
      </g>
    ),
  },
  trophy: {
    name: 'Trophy',
    render: () => (
      <g>
        <rect x="60" y="200" width="20" height="7" rx="2" fill="#8a6d3f" />
        <rect x="67" y="190" width="6" height="12" fill="#d9a441" />
        <path d="M58 172 Q58 190 70 190 Q82 190 82 172 L82 176 Q82 184 70 184 Q58 184 58 176 Z" fill="#f2c94c" />
        <circle cx="52" cy="176" r="6" fill="none" stroke="#f2c94c" strokeWidth="3" />
        <circle cx="88" cy="176" r="6" fill="none" stroke="#f2c94c" strokeWidth="3" />
      </g>
    ),
  },
  ball: {
    name: 'Bouncy Ball',
    render: () => (
      <g>
        <ellipse cx="132" cy="211" rx="13" ry="3" fill="rgba(0,0,0,0.15)" />
        <circle cx="132" cy="197" r="14" fill="#e0575a" />
        <path d="M118 197 Q132 209 146 197" fill="none" stroke="#fff" strokeWidth="3" />
        <line x1="132" y1="183" x2="132" y2="211" stroke="#fff" strokeWidth="3" />
      </g>
    ),
  },
};
