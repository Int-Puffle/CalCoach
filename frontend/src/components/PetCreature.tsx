type PetCreatureProps = {
  mood: string;
  celebrating: boolean;
};

function Face({ mood }: { mood: string }) {
  if (mood === 'happy') {
    return (
      <g>
        <path
          d="M58 98 Q75 82 92 98"
          fill="none"
          stroke="#2b2b2b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M108 98 Q125 82 142 98"
          fill="none"
          stroke="#2b2b2b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M80 132 Q100 156 120 132 Q100 148 80 132 Z" fill="#7a2e2e" />
        <path d="M80 132 Q100 156 120 132" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      </g>
    );
  }

  if (mood === 'sad') {
    return (
      <g>
        <ellipse cx="75" cy="102" rx="14" ry="16" fill="#fff" />
        <ellipse cx="125" cy="102" rx="14" ry="16" fill="#fff" />
        <circle cx="75" cy="107" r="6.5" fill="#2b2b2b" />
        <circle cx="125" cy="107" r="6.5" fill="#2b2b2b" />
        <path d="M60 92 Q75 86 88 93" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
        <path d="M112 93 Q125 86 140 92" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
        <path d="M65 90 Q75 84 90 90 L90 90 Q75 82 65 90 Z" fill="#4c8038" />
        <path d="M110 90 Q125 84 135 90 L135 90 Q125 82 110 90 Z" fill="#4c8038" />
        <path d="M85 140 Q100 132 115 140" fill="none" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
        <ellipse className="pet-tear" cx="88" cy="118" rx="4" ry="6" fill="#7fd0e8" opacity="0.85" />
      </g>
    );
  }

  if (mood === 'sick') {
    return (
      <g stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round">
        <line x1="66" y1="92" x2="84" y2="110" />
        <line x1="84" y1="92" x2="66" y2="110" />
        <line x1="116" y1="92" x2="134" y2="110" />
        <line x1="134" y1="92" x2="116" y2="110" />
        <path d="M85 138 Q92 132 100 138 Q108 144 115 138" fill="none" strokeWidth="4" />
      </g>
    );
  }

  // neutral
  return (
    <g>
      <ellipse cx="75" cy="100" rx="14" ry="16" fill="#fff" />
      <ellipse cx="125" cy="100" rx="14" ry="16" fill="#fff" />
      <circle cx="76" cy="103" r="6.5" fill="#2b2b2b" />
      <circle cx="126" cy="103" r="6.5" fill="#2b2b2b" />
      <circle cx="73.5" cy="100.5" r="2" fill="#fff" />
      <circle cx="123.5" cy="100.5" r="2" fill="#fff" />
      <rect className="pet-eyelid" x="60" y="84" width="30" height="16" rx="8" fill="#5f9e48" />
      <rect className="pet-eyelid" x="110" y="84" width="30" height="16" rx="8" fill="#5f9e48" />
      <path d="M88 138 Q100 144 112 138" fill="none" stroke="#2b2b2b" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}

function PetCreature({ mood, celebrating }: PetCreatureProps) {
  const normalizedMood = ['happy', 'neutral', 'sad', 'sick'].includes(mood) ? mood : 'neutral';

  return (
    <svg
      viewBox="0 0 200 220"
      className={`pet-creature mood-${normalizedMood}${celebrating ? ' is-celebrating' : ''}`}
      role="img"
      aria-label={`Your pet is feeling ${normalizedMood}`}
    >
      <ellipse cx="100" cy="207" rx="52" ry="9" className="pet-shadow" />

      {normalizedMood === 'happy' && (
        <g className="pet-sparkles">
          <path className="pet-sparkle pet-sparkle-1" d="M35 55 L38 63 L46 66 L38 69 L35 77 L32 69 L24 66 L32 63 Z" fill="#ffe27a" />
          <path className="pet-sparkle pet-sparkle-2" d="M165 40 L167 46 L173 48 L167 50 L165 56 L163 50 L157 48 L163 46 Z" fill="#ffe27a" />
          <path className="pet-sparkle pet-sparkle-3" d="M172 90 L174 95 L179 97 L174 99 L172 104 L170 99 L165 97 L170 95 Z" fill="#ffe27a" />
        </g>
      )}

      {normalizedMood === 'sick' && (
        <g className="pet-nausea">
          <path className="pet-nausea-line pet-nausea-1" d="M50 70 Q55 60 50 50" fill="none" stroke="#9fcf86" strokeWidth="3" strokeLinecap="round" />
          <path className="pet-nausea-line pet-nausea-2" d="M150 65 Q145 55 150 45" fill="none" stroke="#9fcf86" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      <g className="pet-body-wrap">
        <g className="pet-leg pet-leg-left">
          <rect x="68" y="168" width="26" height="34" rx="13" fill="#4c8038" />
          <ellipse cx="81" cy="203" rx="18" ry="9" fill="#3d6a2e" />
        </g>
        <g className="pet-leg pet-leg-right">
          <rect x="106" y="168" width="26" height="34" rx="13" fill="#4c8038" />
          <ellipse cx="119" cy="203" rx="18" ry="9" fill="#3d6a2e" />
        </g>

        <g className="pet-arm pet-arm-left">
          <rect x="26" y="103" width="26" height="62" rx="13" fill="#5f9e48" />
        </g>
        <g className="pet-arm pet-arm-right">
          <rect x="148" y="103" width="26" height="62" rx="13" fill="#5f9e48" />
        </g>

        <g className="pet-body">
          <ellipse cx="100" cy="115" rx="68" ry="78" fill="#5f9e48" />
          <ellipse cx="100" cy="140" rx="38" ry="42" fill="#86c766" />

          <g fill="#4c8038">
            <circle cx="52" cy="60" r="15" />
            <circle cx="68" cy="38" r="14" />
            <circle cx="88" cy="26" r="15" />
            <circle cx="112" cy="26" r="15" />
            <circle cx="132" cy="38" r="14" />
            <circle cx="148" cy="60" r="15" />
          </g>

          <path d="M92 18 Q86 4 96 -2 Q104 6 98 18 Z" fill="#79c25a" />
          <path d="M104 20 Q112 6 122 4 Q118 16 108 22 Z" fill="#79c25a" />

          <ellipse cx="65" cy="122" rx="9" ry="6" fill="#ffb6c8" opacity="0.55" />
          <ellipse cx="135" cy="122" rx="9" ry="6" fill="#ffb6c8" opacity="0.55" />

          <Face mood={normalizedMood} />
        </g>
      </g>
    </svg>
  );
}

export default PetCreature;
