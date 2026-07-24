import { useState } from 'react';
import PetCreature from './PetCreature';
import { useTypewriter } from '../hooks/useTypewriter';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

type Answers = {
  petName: string;
  gender: 'male' | 'female' | 'other' | '';
  age: string;
  height: string;
  heightUnit: 'cm' | 'in';
  weight: string;
  weightUnit: 'kg' | 'lbs';
  activityLevel: string;
  goal: string;
};

const INITIAL_ANSWERS: Answers = {
  petName: 'Binky',
  gender: '',
  age: '',
  height: '',
  heightUnit: 'cm',
  weight: '',
  weightUnit: 'kg',
  activityLevel: 'moderate',
  goal: 'maintain',
};

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very_active', label: 'Very active (physical job or 2x/day)' },
];

const GOAL_OPTIONS = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain weight' },
  { value: 'gain', label: 'Gain weight' },
];

// step 0-1: narration only; 2-8: a question; 9: narration then submit
const STEP_TEXT: Record<number, string> = {
  0: "Hi there! I'm Binky! Your CalCoach!",
  1: "Before we begin, let's gather some info about you!",
  2: 'What would you like to name me?',
  3: "What's your gender? This helps me calculate accurate health projections for you.",
  4: 'How old are you?',
  5: 'How tall are you?',
  6: "What's your current weight?",
  7: 'How active are you day-to-day?',
  8: "What's your goal?",
  9: 'Great, let me get everything set up for you...',
};

const LAST_STEP = 9;

function toKg(weight: number, unit: 'kg' | 'lbs') {
  return unit === 'lbs' ? weight * 0.453592 : weight;
}

function toCm(height: number, unit: 'cm' | 'in') {
  return unit === 'in' ? height * 2.54 : height;
}

function OnboardingFlow() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { displayed, done, skip } = useTypewriter(STEP_TEXT[step] ?? '');

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setStep((s) => Math.min(s + 1, LAST_STEP));
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/onboarding/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!._id,
          petName: answers.petName.trim() || 'Binky',
          gender: answers.gender,
          age: Number(answers.age),
          heightCm: Math.round(toCm(Number(answers.height), answers.heightUnit)),
          weightKg: Math.round(toKg(Number(answers.weight), answers.weightUnit) * 10) / 10,
          activityLevel: answers.activityLevel,
          goal: answers.goal,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      await refreshUser();
    } catch (err) {
      setError(String(err));
      setSubmitting(false);
    }
  }

  const isNarration = step === 0 || step === 1 || step === LAST_STEP;

  let canAdvance = true;
  if (step === 3) canAdvance = answers.gender !== '';
  if (step === 4) {
    const age = Number(answers.age);
    canAdvance = answers.age !== '' && age >= 5 && age <= 120;
  }
  if (step === 5) {
    const h = Number(answers.height);
    canAdvance = answers.height !== '' && h > 0;
  }
  if (step === 6) {
    const w = Number(answers.weight);
    canAdvance = answers.weight !== '' && w > 0;
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-pet">
          <PetCreature mood="happy" />
        </div>

        <div className="speech-bubble" onClick={!done ? skip : undefined} role={!done ? 'button' : undefined}>
          <p>{displayed}</p>
          {!done && <span className="speech-cursor">|</span>}
        </div>

        {done && isNarration && step !== LAST_STEP && (
          <button type="button" className="primary-btn onboarding-btn" onClick={goNext}>
            Continue
          </button>
        )}

        {done && step === LAST_STEP && (
          <>
            {error && <p className="form-message error">{error}</p>}
            <button type="button" className="primary-btn onboarding-btn" onClick={handleFinalSubmit} disabled={submitting}>
              {submitting ? 'Setting up...' : "Let's go!"}
            </button>
          </>
        )}

        {done && step === 2 && (
          <div className="onboarding-question">
            <input
              type="text"
              className="onboarding-text-input"
              value={answers.petName}
              onChange={(e) => update('petName', e.target.value)}
              maxLength={24}
              placeholder="Binky"
            />
            <button type="button" className="primary-btn onboarding-btn" onClick={goNext}>
              Next
            </button>
          </div>
        )}

        {done && step === 3 && (
          <div className="onboarding-question">
            <div className="onboarding-choice-row">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`onboarding-choice ${answers.gender === g ? 'active' : ''}`}
                  onClick={() => update('gender', g)}
                >
                  {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                </button>
              ))}
            </div>
            <button type="button" className="primary-btn onboarding-btn" onClick={goNext} disabled={!canAdvance}>
              Next
            </button>
          </div>
        )}

        {done && step === 4 && (
          <div className="onboarding-question">
            <input
              type="number"
              className="onboarding-text-input"
              value={answers.age}
              onChange={(e) => update('age', e.target.value)}
              placeholder="Age in years"
              min={5}
              max={120}
            />
            <button type="button" className="primary-btn onboarding-btn" onClick={goNext} disabled={!canAdvance}>
              Next
            </button>
          </div>
        )}

        {done && step === 5 && (
          <div className="onboarding-question">
            <div className="onboarding-unit-row">
              <input
                type="number"
                className="onboarding-text-input"
                value={answers.height}
                onChange={(e) => update('height', e.target.value)}
                placeholder={answers.heightUnit === 'cm' ? 'Height in cm' : 'Height in inches'}
                min={1}
              />
              <div className="onboarding-unit-toggle">
                <button
                  type="button"
                  className={answers.heightUnit === 'cm' ? 'active' : ''}
                  onClick={() => update('heightUnit', 'cm')}
                >
                  cm
                </button>
                <button
                  type="button"
                  className={answers.heightUnit === 'in' ? 'active' : ''}
                  onClick={() => update('heightUnit', 'in')}
                >
                  in
                </button>
              </div>
            </div>
            <button type="button" className="primary-btn onboarding-btn" onClick={goNext} disabled={!canAdvance}>
              Next
            </button>
          </div>
        )}

        {done && step === 6 && (
          <div className="onboarding-question">
            <div className="onboarding-unit-row">
              <input
                type="number"
                className="onboarding-text-input"
                value={answers.weight}
                onChange={(e) => update('weight', e.target.value)}
                placeholder={answers.weightUnit === 'kg' ? 'Weight in kg' : 'Weight in lbs'}
                min={1}
              />
              <div className="onboarding-unit-toggle">
                <button
                  type="button"
                  className={answers.weightUnit === 'kg' ? 'active' : ''}
                  onClick={() => update('weightUnit', 'kg')}
                >
                  kg
                </button>
                <button
                  type="button"
                  className={answers.weightUnit === 'lbs' ? 'active' : ''}
                  onClick={() => update('weightUnit', 'lbs')}
                >
                  lbs
                </button>
              </div>
            </div>
            <button type="button" className="primary-btn onboarding-btn" onClick={goNext} disabled={!canAdvance}>
              Next
            </button>
          </div>
        )}

        {done && step === 7 && (
          <div className="onboarding-question">
            <div className="onboarding-choice-col">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`onboarding-choice ${answers.activityLevel === opt.value ? 'active' : ''}`}
                  onClick={() => update('activityLevel', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button type="button" className="primary-btn onboarding-btn" onClick={goNext}>
              Next
            </button>
          </div>
        )}

        {done && step === 8 && (
          <div className="onboarding-question">
            <div className="onboarding-choice-row">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`onboarding-choice ${answers.goal === opt.value ? 'active' : ''}`}
                  onClick={() => update('goal', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button type="button" className="primary-btn onboarding-btn" onClick={goNext}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;
