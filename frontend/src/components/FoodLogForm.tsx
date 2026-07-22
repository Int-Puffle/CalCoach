import { useState, type FormEvent } from 'react';
import { API_BASE } from '../config';

type FoodLogFormProps = {
  userId: string;
  onLogSuccess: (mood: string, moodScore: number) => void;
};

type SearchResult = {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  basis: string;
};

function FoodLogForm({ userId, onLogSuccess }: FoodLogFormProps) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setSearchError('');
    setResults([]);

    try {
      const response = await fetch(`${API_BASE}/api/foodsearch?q=${encodeURIComponent(q)}`);
      const data = await response.json();

      if (data.error) {
        setSearchError(data.error);
      } else if (data.results.length === 0) {
        setSearchError('No matches found. Try a different search term.');
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setSearchError('Error: ' + String(err));
    } finally {
      setSearching(false);
    }
  }

  function applyResult(result: SearchResult) {
    setFoodName(result.name);
    setCalories(String(result.calories));
    setProtein(String(result.protein));
    setCarbs(String(result.carbs));
    setFat(String(result.fat));
    setResults([]);
    setQuery('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    const obj = {
      userId,
      foodName,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
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
        setCarbs('');
        setFat('');
      }
    } catch (err) {
      setMessage('Error: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Log a Meal</h2>

      <div className="food-search">
        <div className="field-row">
          <label className="field">
            <span>Search a food or brand</span>
            <input
              type="text"
              placeholder="e.g. Cheerios"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
          </label>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchError && <p className="form-message error">{searchError}</p>}

        {results.length > 0 && (
          <ul className="search-results">
            {results.map((r, i) => (
              <li key={i}>
                <div className="result-info">
                  <strong>{r.name}</strong>
                  {r.brand && <span className="result-brand"> — {r.brand}</span>}
                  <div className="result-macros">
                    {r.calories} kcal · {r.protein}g protein · {r.carbs}g carbs · {r.fat}g fat ({r.basis})
                  </div>
                </div>
                <button type="button" className="secondary-btn" onClick={() => applyResult(r)}>
                  Use
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="food-log-form" onSubmit={handleSubmit}>
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
        <div className="field-row">
          <label className="field">
            <span>Carbs (g)</span>
            <input
              type="number"
              placeholder="0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              min={0}
            />
          </label>
          <label className="field">
            <span>Fat (g)</span>
            <input
              type="number"
              placeholder="0"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              min={0}
            />
          </label>
        </div>
        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting ? 'Logging...' : 'Log Food'}
        </button>
        {message && <p className={`form-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
      </form>
    </div>
  );
}

export default FoodLogForm;
