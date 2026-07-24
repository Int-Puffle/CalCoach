import { useEffect, useState } from 'react';
import PetScene from './PetScene';

type PetDisplayProps = {
  mood: string;
  moodScore: number;
  reaction?: 'good' | 'neutral' | 'bad' | null;
  reactionKey?: number;
  background?: string;
  furniture?: string[];
};

const moodLabels: Record<string, string> = {
  happy: 'Happy',
  neutral: 'Doing okay',
  sad: 'Feeling low',
  sick: 'Not feeling great',
};

function PetDisplay({ mood, moodScore, reaction, reactionKey, background = 'meadow', furniture = [] }: PetDisplayProps) {
  const [activeReaction, setActiveReaction] = useState<'good' | 'neutral' | 'bad' | null>(null);

  useEffect(() => {
    if (!reactionKey || !reaction) return;
    setActiveReaction(reaction);
    const timeout = setTimeout(() => setActiveReaction(null), 1100);
    return () => clearTimeout(timeout);
  }, [reactionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pet-display">
      <PetScene mood={mood} reaction={activeReaction} background={background} furniture={furniture} />
      <div className="pet-info">
        <p className="pet-mood-label">{moodLabels[mood] || 'Doing okay'}</p>
        <div className="mood-bar-track">
          <div className="mood-bar-fill" style={{ width: `${Math.min(Math.max(moodScore, 0), 100)}%` }} />
        </div>
        <p className="mood-score-label">Mood Score: {moodScore}</p>
      </div>
    </div>
  );
}

export default PetDisplay;
