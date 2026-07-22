import { useState, type FormEvent } from 'react';
import { API_BASE } from '../config';

type FoodLogFormProps = {
  userId: string;
  onLogSuccess: (mood: string, moodScore: number) => void;
};

function FoodLogForm({ userId, onLogSuccess }: FoodLogFormProps) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    const obj = {
      userId,
      foodName,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: 0,
      fat: 0,
    };

    try {
      const response = await fetch(`${API_BASE}/api/foodlog`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await response.json();

      if (res.error) {
        setMessage('Error: ' + res.error);
      } else {
        setMessage('Logged!');
        onLogSuccess(res.petState.mood, res.petState.moodScore);
        setFoodName('');
        setCalories('');
        setProtein('');
      }
    } catch (err) {
      setMessage('Error: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="food-log-form" onSubmit={handleSubmit}>
      <h2>Log a Meal</h2>
      <label className="field">
        <span>Food name</span>
        <input
          type="text"
          placeholder="e.g. Grilled chicken salad"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
        />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Calories</span>
          <input
            type="number"
            placeholder="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
            min={0}
          />
        </label>
        <label className="field">
          <span>Protein (g)</span>
          <input
            type="number"
            placeholder="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            min={0}
          />
        </label>
      </div>
      <button className="primary-btn" type="submit" disabled={submitting}>
        {submitting ? 'Logging...' : 'Log Food'}
      </button>
      {message && <p className={`form-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
    </form>
  );
}

export default FoodLogForm;
