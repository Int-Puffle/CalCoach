function calculateMoodFromCalories(totalCalories) {
  let moodScore = 50;
  if (totalCalories > 0 && totalCalories <= 2200) moodScore = 80;
  else if (totalCalories > 2200 && totalCalories <= 2800) moodScore = 60;
  else if (totalCalories > 2800) moodScore = 30;

  let mood = 'neutral';
  if (moodScore >= 70) mood = 'happy';
  else if (moodScore >= 45) mood = 'neutral';
  else mood = 'sad';

  return { mood, moodScore };
}

module.exports = { calculateMoodFromCalories };
