import { useState } from 'react';

type FoodLogFormProps = {
  userId: string;
  onLogSuccess: (mood: string, moodScore: number) => void;
};

function FoodLogForm({ userId, onLogSuccess }: FoodLogFormProps) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setMessage('');

    const obj = {
      userId,
      foodName,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: 0,
      fat: 0,
    };

    try {
      const response = await fetch('http://localhost:5000/api/foodlog', {
        method: 'POST',
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
    } catch (err: any) {
      setMessage('Error: ' + err.toString());
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Food name"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />
      <br />
      <input
        type="number"
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <br />
      <input
        type="number"
        placeholder="Protein (g)"
        value={protein}
        onChange={(e) => setProtein(e.target.value)}
      />
      <br />
      <button type="submit">Log Food</button>
      <p>{message}</p>
    </form>
  );
}

export default FoodLogForm;