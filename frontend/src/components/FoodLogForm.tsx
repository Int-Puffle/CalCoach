import { useEffect, useState, type FormEvent } from 'react';
import { API_BASE } from '../config';

export type LogSuccessResult = {
  mood: string;
  moodScore: number;
  coinsAwarded: number;
  mealBonusAwarded: boolean;
  mealQuality: 'good' | 'neutral' | 'bad';
};

type FoodLogFormProps = {
  userId: string;
  onLogSuccess: (result: LogSuccessResult) => void;
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

const SEARCH_DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

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

  // Live search as the user types, debounced so we're not firing a
  // request on every keystroke, with stale responses discarded.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearchError('');
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const debounce = setTimeout(() => {
      fetch(`${API_BASE}/api/foodsearch?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setSearchError(data.error);
            setResults([]);
          } else if (data.results.length === 0) {
            setSearchError('No matches found. Try a different search term.');
            setResults([]);
          } else {
            setSearchError('');
            setResults(data.results);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setSearchError('Error: ' + String(err));
            setResults([]);
          }
        })
        .finally(() => setSearching(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

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
        onLogSuccess({
          mood: res.petState.mood,
          moodScore: res.petState.moodScore,
          coinsAwarded: res.coinsAwarded,
          mealBonusAwarded: res.mealBonusAwarded,
          mealQuality: res.mealQuality,
        });
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
        <label className="field">
          <span>Search a food or brand</span>
          <input
            type="text"
            placeholder="e.g. Cheerios"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>

        {searching && <p className="search-status">Searching...</p>}
        {!searching && searchError && <p className="form-message error">{searchError}</p>}

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
