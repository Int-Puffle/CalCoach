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
};
