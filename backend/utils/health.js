// Mifflin-St Jeor BMR, scaled to a TDEE by activity level, then nudged by
// the user's stated goal. This drives their default calorie/protein goals
// so charts and pet mood are based on the user's real numbers, not a
// one-size-fits-all baseline.

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_MULTIPLIERS = {
  lose: 0.85,
  maintain: 1.0,
  gain: 1.15,
};

const MIN_CALORIE_GOAL = 1200;
const MAX_CALORIE_GOAL = 5000;
const PROTEIN_G_PER_KG = 1.2;

function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function calculateBMR({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'female' ? base - 161 : base + 5;
}

function calculateGoals({ gender, weightKg, heightCm, age, activityLevel, goal }) {
  const bmr = calculateBMR({ gender, weightKg, heightCm, age });
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  const goalMultiplier = GOAL_MULTIPLIERS[goal] || GOAL_MULTIPLIERS.maintain;
  const tdee = bmr * activityMultiplier * goalMultiplier;

  const dailyCalorieGoal = Math.min(
    MAX_CALORIE_GOAL,
    Math.max(MIN_CALORIE_GOAL, Math.round(tdee / 10) * 10)
  );
  const dailyProteinGoal = Math.round(weightKg * PROTEIN_G_PER_KG);
  const bmi = Math.round(calculateBMI(weightKg, heightCm) * 10) / 10;

  return { dailyCalorieGoal, dailyProteinGoal, bmi };
}

module.exports = { calculateBMI, calculateBMR, calculateGoals };
