const { calculateBMI, calculateBMR, calculateGoals } = require('../utils/health');

describe('calculateBMI', () => {
  it('computes BMI from weight and height', () => {
    expect(calculateBMI(80, 180)).toBeCloseTo(24.69, 1);
  });
});

describe('calculateBMR', () => {
  it('uses the male Mifflin-St Jeor offset', () => {
    expect(calculateBMR({ gender: 'male', weightKg: 80, heightCm: 180, age: 30 })).toBeCloseTo(1780, 0);
  });

  it('uses the female Mifflin-St Jeor offset', () => {
    expect(calculateBMR({ gender: 'female', weightKg: 60, heightCm: 165, age: 25 })).toBeCloseTo(1345.25, 1);
  });

  it('treats "other" gender the same as the male offset', () => {
    expect(calculateBMR({ gender: 'other', weightKg: 80, heightCm: 180, age: 30 })).toBeCloseTo(1780, 0);
  });
});

describe('calculateGoals', () => {
  it('computes calorie/protein goals and BMI for a maintain goal', () => {
    const result = calculateGoals({
      gender: 'male',
      weightKg: 80,
      heightCm: 180,
      age: 30,
      activityLevel: 'moderate',
      goal: 'maintain',
    });
    expect(result.dailyCalorieGoal).toBe(2760);
    expect(result.dailyProteinGoal).toBe(96);
    expect(result.bmi).toBeCloseTo(24.7, 1);
  });

  it('lowers the calorie goal for a lose goal vs maintain', () => {
    const base = { gender: 'female', weightKg: 60, heightCm: 165, age: 25, activityLevel: 'sedentary' };
    const maintain = calculateGoals({ ...base, goal: 'maintain' });
    const lose = calculateGoals({ ...base, goal: 'lose' });
    expect(lose.dailyCalorieGoal).toBeLessThan(maintain.dailyCalorieGoal);
  });

  it('raises the calorie goal for a gain goal vs maintain', () => {
    const base = { gender: 'male', weightKg: 80, heightCm: 180, age: 30, activityLevel: 'active' };
    const maintain = calculateGoals({ ...base, goal: 'maintain' });
    const gain = calculateGoals({ ...base, goal: 'gain' });
    expect(gain.dailyCalorieGoal).toBeGreaterThan(maintain.dailyCalorieGoal);
  });

  it('never drops the calorie goal below the safety floor', () => {
    const result = calculateGoals({
      gender: 'female',
      weightKg: 40,
      heightCm: 150,
      age: 70,
      activityLevel: 'sedentary',
      goal: 'lose',
    });
    expect(result.dailyCalorieGoal).toBe(1200);
  });

  it('never raises the calorie goal above the safety ceiling', () => {
    const result = calculateGoals({
      gender: 'male',
      weightKg: 200,
      heightCm: 220,
      age: 20,
      activityLevel: 'very_active',
      goal: 'gain',
    });
    expect(result.dailyCalorieGoal).toBe(5000);
  });

  it('falls back to moderate activity and maintain goal when unspecified', () => {
    const explicit = calculateGoals({
      gender: 'male',
      weightKg: 80,
      heightCm: 180,
      age: 30,
      activityLevel: 'moderate',
      goal: 'maintain',
    });
    const implicit = calculateGoals({ gender: 'male', weightKg: 80, heightCm: 180, age: 30 });
    expect(implicit).toEqual(explicit);
  });
});
