const { calculateMood } = require('../utils/mood');

describe('calculateMood', () => {
  it('stays neutral with no calories logged', () => {
    expect(calculateMood({ calories: 0, protein: 0, carbs: 0, fat: 0 }, {})).toEqual({
      mood: 'neutral',
      moodScore: 50,
    });
  });

  it('is happy when every macro lands on its goal', () => {
    const result = calculateMood(
      { calories: 2000, protein: 100, carbs: 225, fat: 56 },
      { dailyCalorieGoal: 2000, dailyProteinGoal: 100 }
    );
    expect(result.mood).toBe('happy');
    expect(result.moodScore).toBeGreaterThanOrEqual(70);
  });

  it('falls back to default goals when the user has none set', () => {
    const result = calculateMood({ calories: 2000, protein: 100, carbs: 225, fat: 56 }, {});
    expect(result.mood).toBe('happy');
  });

  it('is sad when badly under-eating across the board', () => {
    const result = calculateMood(
      { calories: 150, protein: 5, carbs: 20, fat: 5 },
      { dailyCalorieGoal: 2000, dailyProteinGoal: 100 }
    );
    expect(result.mood).toBe('sad');
    expect(result.moodScore).toBeLessThan(45);
  });

  it('turns sick from drastic overeating, not just mildly over goal', () => {
    const moderate = calculateMood(
      { calories: 2400, protein: 120, carbs: 270, fat: 67 },
      { dailyCalorieGoal: 2000, dailyProteinGoal: 100 }
    );
    expect(moderate.mood).not.toBe('sick');

    const extreme = calculateMood(
      { calories: 4200, protein: 170, carbs: 450, fat: 160 },
      { dailyCalorieGoal: 2000, dailyProteinGoal: 100 }
    );
    expect(extreme.mood).toBe('sick');
  });

  it('respects a user\'s own calorie/protein goals rather than the defaults', () => {
    const result = calculateMood(
      { calories: 1500, protein: 60, carbs: 169, fat: 42 },
      { dailyCalorieGoal: 1500, dailyProteinGoal: 60 }
    );
    expect(result.mood).toBe('happy');
  });

  it('penalizes a macro thats badly out of balance even if calories are on target', () => {
    const balanced = calculateMood(
      { calories: 2000, protein: 100, carbs: 225, fat: 56 },
      { dailyCalorieGoal: 2000, dailyProteinGoal: 100 }
    );
    const noProtein = calculateMood(
      { calories: 2000, protein: 0, carbs: 350, fat: 56 },
      { dailyCalorieGoal: 2000, dailyProteinGoal: 100 }
    );
    expect(noProtein.moodScore).toBeLessThan(balanced.moodScore);
  });
});
