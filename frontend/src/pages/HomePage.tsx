import { useState } from 'react';
import FoodLogForm from '../components/FoodLogForm';
import PetDisplay from '../components/PetDisplay';

const TEST_USER_ID = '507f1f77bcf86cd799439011';

function HomePage() {
  const [mood, setMood] = useState('neutral');
  const [moodScore, setMoodScore] = useState(50);

  function handleLogSuccess(newMood: string, newMoodScore: number) {
    setMood(newMood);
    setMoodScore(newMoodScore);
  }

  return (
    <div>
      <h1>CalCoach</h1>
      <PetDisplay mood={mood} moodScore={moodScore} />
      <FoodLogForm userId={TEST_USER_ID} onLogSuccess={handleLogSuccess} />
    </div>
  );
}

export default HomePage;