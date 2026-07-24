// Standard macro splits used to derive carb/fat targets from a calorie goal,
// since users only set a calorie + protein goal (protein needs its own goal
// because it doesn't scale with calories the way carbs/fat do).
const CARBS_SHARE_OF_CALORIES = 0.45;
const FAT_SHARE_OF_CALORIES = 0.25;
const CARB_KCAL_PER_G = 4;
const FAT_KCAL_PER_G = 9;

// A macro scores 100 within +/-15% of its goal, and falls off linearly the
// further it strays in either direction - under-eating and over-eating are
// penalized the same way.
function scoreMacro(actual, goal) {
  if (!goal || goal <= 0) return 50;
  const ratio = actual / goal;
  if (ratio >= 0.85 && ratio <= 1.15) return 100;
  const distance = ratio < 0.85 ? 0.85 - ratio : ratio - 1.15;
  return Math.max(0, Math.round(100 - (distance / 0.85) * 100));
}

function calculateMood(totals, goals = {}) {
  const calories = totals.calories || 0;
  const protein = totals.protein || 0;
  const carbs = totals.carbs || 0;
  const fat = totals.fat || 0;

  if (calories <= 0) {
    return { mood: 'neutral', moodScore: 50 };
  }

  const calorieGoal = goals.dailyCalorieGoal || 2000;
  const proteinGoal = goals.dailyProteinGoal || 100;
  const carbsGoal = Math.round((calorieGoal * CARBS_SHARE_OF_CALORIES) / CARB_KCAL_PER_G);
  const fatGoal = Math.round((calorieGoal * FAT_SHARE_OF_CALORIES) / FAT_KCAL_PER_G);

  const calorieScore = scoreMacro(calories, calorieGoal);
  const proteinScore = scoreMacro(protein, proteinGoal);
  const carbsScore = scoreMacro(carbs, carbsGoal);
  const fatScore = scoreMacro(fat, fatGoal);

  const moodScore = Math.round(
    calorieScore * 0.4 + proteinScore * 0.25 + carbsScore * 0.2 + fatScore * 0.15
  );

  let mood;
  if (moodScore >= 70) mood = 'happy';
  else if (moodScore >= 45) mood = 'neutral';
  else if (calories > calorieGoal * 1.75) mood = 'sick';
  else mood = 'sad';

  return { mood, moodScore };
}

// Per-meal scoring is deliberately looser than the daily scoreMacro band
// (0.4x-1.6x of a meal's 1/3-of-daily share counts as "on track") since one
// meal legitimately varies in size a lot more than a full day's total does.
function scoreMealMacro(actual, perMealGoal) {
  if (!perMealGoal || perMealGoal <= 0) return 50;
  const ratio = actual / perMealGoal;
  if (ratio >= 0.4 && ratio <= 1.6) return 100;
  const distance = ratio < 0.4 ? 0.4 - ratio : ratio - 1.6;
  return Math.max(0, Math.round(100 - (distance / 0.6) * 100));
}

// Judges a single logged meal in isolation (not the day's cumulative total),
// for the instant reaction animation right after logging. Weighs calories and
// fat most heavily since those are the two macros a single "bad" meal is
// usually driven by.
function calculateMealQuality(meal, goals = {}) {
  const calories = meal.calories || 0;
  if (calories <= 0) return 'neutral';

  const calorieGoal = goals.dailyCalorieGoal || 2000;
  const proteinGoal = goals.dailyProteinGoal || 100;
  const carbsGoal = Math.round((calorieGoal * CARBS_SHARE_OF_CALORIES) / CARB_KCAL_PER_G);
  const fatGoal = Math.round((calorieGoal * FAT_SHARE_OF_CALORIES) / FAT_KCAL_PER_G);

  const calorieScore = scoreMealMacro(calories, calorieGoal / 3);
  const proteinScore = scoreMealMacro(meal.protein || 0, proteinGoal / 3);
  const carbsScore = scoreMealMacro(meal.carbs || 0, carbsGoal / 3);
  const fatScore = scoreMealMacro(meal.fat || 0, fatGoal / 3);

  const score = calorieScore * 0.5 + proteinScore * 0.15 + carbsScore * 0.1 + fatScore * 0.25;

  if (score >= 65) return 'good';
  if (score <= 30) return 'bad';
  return 'neutral';
}

module.exports = { calculateMood, calculateMealQuality };
