type PetDisplayProps = {
  mood: string;
  moodScore: number;
};

const emojiMap: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  sick: '🤢',
};

const moodLabels: Record<string, string> = {
  happy: 'Happy',
  neutral: 'Doing okay',
  sad: 'Feeling low',
  sick: 'Not feeling great',
};

function PetDisplay({ mood, moodScore }: PetDisplayProps) {
  return (
    <div className="pet-display">
      <div className="pet-emoji" aria-hidden="true">
        {emojiMap[mood] || '😐'}
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
