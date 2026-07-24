import { useEffect, useState } from 'react';
import PetCreature from './PetCreature';

type PetDisplayProps = {
  mood: string;
  moodScore: number;
  celebrateKey?: number;
};

const moodLabels: Record<string, string> = {
  happy: 'Happy',
  neutral: 'Doing okay',
  sad: 'Feeling low',
  sick: 'Not feeling great',
};

function PetDisplay({ mood, moodScore, celebrateKey }: PetDisplayProps) {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!celebrateKey) return;
    setCelebrating(true);
    const timeout = setTimeout(() => setCelebrating(false), 1100);
    return () => clearTimeout(timeout);
  }, [celebrateKey]);

  return (
    <div className="pet-display">
      <div className="pet-creature-stage">
        <PetCreature mood={mood} celebrating={celebrating} />
      </div>
      <p className="pet-mood-label">{moodLabels[mood] || 'Doing okay'}</p>
      <div className="mood-bar-track">
        <div className="mood-bar-fill" style={{ width: `${Math.min(Math.max(moodScore, 0), 100)}%` }} />
      </div>
      <p className="mood-score-label">Mood Score: {moodScore}</p>
    </div>
  );
}

export default PetDisplay;
