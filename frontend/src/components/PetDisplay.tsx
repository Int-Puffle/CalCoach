type PetDisplayProps = {
  mood: string;
  moodScore: number;
};

function PetDisplay({ mood, moodScore }: PetDisplayProps) {
  const emojiMap: Record<string, string> = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    sick: '🤢',
  };

  return (
    <div id="petDisplayDiv">
      <div style={{ fontSize: '80px' }}>{emojiMap[mood] || '😐'}</div>
      <p>Mood: {mood}</p>
      <p>Mood Score: {moodScore}</p>
    </div>
  );
}

export default PetDisplay;