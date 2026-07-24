import { useEffect, useState } from 'react';

type PetCreatureProps = {
  mood: string;
  reaction?: 'good' | 'neutral' | 'bad' | null;
};

const VARIANT_COUNT = 3;

// --- Happy ---

function HappyFace1() {
  return (
    <g>
      <path d="M58 98 Q75 82 92 98" fill="none" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" />
      <path d="M108 98 Q125 82 142 98" fill="none" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" />
      <path d="M80 132 Q100 156 120 132 Q100 148 80 132 Z" fill="#7a2e2e" />
      <path d="M80 132 Q100 156 120 132" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function HappyFace2() {
  return (
    <g>
      <ellipse cx="75" cy="98" rx="15" ry="17" fill="#fff" />
      <ellipse cx="125" cy="98" rx="15" ry="17" fill="#fff" />
      <circle cx="76" cy="102" r="8" fill="#2b2b2b" />
      <circle cx="126" cy="102" r="8" fill="#2b2b2b" />
      <circle cx="72" cy="97" r="2.4" fill="#fff" />
      <circle cx="122" cy="97" r="2.4" fill="#fff" />
      <ellipse cx="100" cy="139" rx="14" ry="12" fill="#7a2e2e" />
      <ellipse cx="100" cy="139" rx="14" ry="12" fill="none" stroke="#2b2b2b" strokeWidth="3" />
    </g>
  );
}

function HappyFace3() {
  return (
    <g>
      <path d="M60 100 Q75 92 90 100" fill="none" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="125" cy="100" rx="14" ry="16" fill="#fff" />
      <circle cx="126" cy="104" r="6.5" fill="#2b2b2b" />
      <circle cx="123" cy="99" r="2" fill="#fff" />
      <path d="M85 135 Q100 146 118 130" fill="none" stroke="#2b2b2b" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}

// --- Neutral ---

function NeutralFace1() {
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

function NeutralFace2() {
  return (
    <g>
      <ellipse cx="75" cy="100" rx="14" ry="16" fill="#fff" />
      <ellipse cx="125" cy="100" rx="14" ry="16" fill="#fff" />
      <circle cx="80" cy="103" r="6.5" fill="#2b2b2b" />
      <circle cx="130" cy="103" r="6.5" fill="#2b2b2b" />
      <line x1="90" y1="140" x2="110" y2="140" stroke="#2b2b2b" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}

function NeutralFace3() {
  return (
    <g>
      <path d="M62 100 Q75 106 88 100" fill="none" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
      <path d="M112 100 Q125 106 138 100" fill="none" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="100" cy="140" rx="6" ry="8" fill="#7a2e2e" />
      <text x="140" y="45" className="pet-zzz pet-zzz-1" fontSize="16" fontFamily="sans-serif" fill="#4c8038">Z</text>
      <text x="152" y="32" className="pet-zzz pet-zzz-2" fontSize="12" fontFamily="sans-serif" fill="#4c8038">Z</text>
    </g>
  );
}

// --- Sad ---

function SadFace1() {
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

function SadFace2() {
  return (
    <g>
      <line x1="64" y1="100" x2="86" y2="100" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
      <line x1="114" y1="100" x2="136" y2="100" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
      <path d="M60 88 Q75 96 90 90" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 90 Q125 96 140 88" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <path d="M82 135 Q90 142 100 135 Q110 142 118 135" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <ellipse className="pet-tear" cx="75" cy="112" rx="4" ry="6" fill="#7fd0e8" opacity="0.85" />
      <ellipse className="pet-tear pet-tear-2" cx="125" cy="112" rx="4" ry="6" fill="#7fd0e8" opacity="0.85" />
    </g>
  );
}

function SadFace3() {
  return (
    <g>
      <ellipse cx="75" cy="99" rx="15" ry="18" fill="#fff" />
      <ellipse cx="125" cy="99" rx="15" ry="18" fill="#fff" />
      <circle cx="75" cy="96" r="6.5" fill="#2b2b2b" />
      <circle cx="125" cy="96" r="6.5" fill="#2b2b2b" />
      <path d="M60 84 Q75 78 90 86" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 86 Q125 78 140 84" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <path d="M88 138 Q94 133 100 138 Q106 133 112 138" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

// --- Sick ---

function SickFace1() {
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

function SickFace2() {
  return (
    <g>
      <path d="M75 92 Q85 92 85 102 Q85 110 75 110 Q68 110 68 103" fill="none" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
      <path d="M125 92 Q135 92 135 102 Q135 110 125 110 Q118 110 118 103" fill="none" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
      <path d="M85 135 Q100 146 115 135" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="100" cy="143" rx="5" ry="7" fill="#e8748a" />
    </g>
  );
}

function SickFace3() {
  return (
    <g>
      <path d="M62 100 Q75 96 88 100 L88 104 Q75 108 62 104 Z" fill="#3d6a2e" opacity="0.75" />
      <path d="M112 100 Q125 96 138 100 L138 104 Q125 108 112 104 Z" fill="#3d6a2e" opacity="0.75" />
      <circle cx="75" cy="103" r="3" fill="#2b2b2b" />
      <circle cx="125" cy="103" r="3" fill="#2b2b2b" />
      <path d="M92 136 Q100 132 108 136" fill="none" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

const FACE_VARIANTS: Record<string, Array<() => React.JSX.Element>> = {
  happy: [HappyFace1, HappyFace2, HappyFace3],
  neutral: [NeutralFace1, NeutralFace2, NeutralFace3],
  sad: [SadFace1, SadFace2, SadFace3],
  sick: [SickFace1, SickFace2, SickFace3],
};

function PetCreature({ mood, reaction }: PetCreatureProps) {
  const normalizedMood = ['happy', 'neutral', 'sad', 'sick'].includes(mood) ? mood : 'neutral';
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    setVariant(Math.floor(Math.random() * VARIANT_COUNT));
  }, [normalizedMood]);

  const Face = FACE_VARIANTS[normalizedMood][variant];
  const reactionClass = reaction ? ` is-reacting-${reaction}` : '';

  return (
    <svg
      viewBox="0 0 200 220"
      className={`pet-creature mood-${normalizedMood}${reactionClass}`}
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

      {reaction === 'good' && (
        <g className="pet-reaction-fx pet-reaction-fx-good">
          <path d="M28 50 L31 58 L39 61 L31 64 L28 72 L25 64 L17 61 L25 58 Z" fill="#ffe27a" />
          <path d="M172 45 L174 51 L180 53 L174 55 L172 61 L170 55 L164 53 L170 51 Z" fill="#ffe27a" />
          <path d="M100 12 L103 20 L111 23 L103 26 L100 34 L97 26 L89 23 L97 20 Z" fill="#ffe27a" />
        </g>
      )}

      {reaction === 'bad' && (
        <g className="pet-reaction-fx pet-reaction-fx-bad">
          <path d="M75 40 Q85 32 95 40 Q105 32 115 40" fill="none" stroke="#9a9a9a" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          <path d="M80 28 Q90 20 100 28 Q110 20 120 28" fill="none" stroke="#b8b8b8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
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

          <Face />
        </g>
      </g>
    </svg>
  );
}

export default PetCreature;
