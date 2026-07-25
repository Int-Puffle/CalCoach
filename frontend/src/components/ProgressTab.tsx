import { useEffect, useState } from 'react';
import TrendChart, { type ChartPoint } from './TrendChart';
import { API_BASE } from '../config';

type ProgressTabProps = {
  userId: string;
  calorieGoal?: number;
};

const RANGE_OPTIONS = [7, 30, 90];

function ProgressTab({ userId, calorieGoal }: ProgressTabProps) {
  const [days, setDays] = useState(30);
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [weightHistory, setWeightHistory] = useState<ChartPoint[]>([]);
  const [goalWeightKg, setGoalWeightKg] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [weightBusy, setWeightBusy] = useState(false);
  const [weightMessage, setWeightMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/api/foodlog/stats/${userId}?days=${days}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setHistory(data.history || []);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [userId, days]);

  function loadWeight() {
    return fetch(`${API_BASE}/api/weight/${userId}?days=${days}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setWeightHistory(data.history || []);
        setGoalWeightKg(data.goalWeightKg ?? null);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadWeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, days]);

  async function handleLogWeight(e: React.FormEvent) {
    e.preventDefault();
    if (!weightInput) return;
    setWeightBusy(true);
    setWeightMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/weight`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, weightKg: Number(weightInput) }),
      });
      const data = await response.json();
      if (data.error) {
        setWeightMessage('Error: ' + data.error);
      } else {
        setWeightMessage('Weight logged!');
        setWeightInput('');
        await loadWeight();
      }
    } catch (err) {
      setWeightMessage('Error: ' + String(err));
    } finally {
      setWeightBusy(false);
    }
  }

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!goalInput) return;
    setWeightBusy(true);
    setWeightMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/weight/goal`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, goalWeightKg: Number(goalInput) }),
      });
      const data = await response.json();
      if (data.error) {
        setWeightMessage('Error: ' + data.error);
      } else {
        setGoalWeightKg(data.goalWeightKg);
        setGoalInput('');
        setWeightMessage('Goal weight updated!');
      }
    } catch (err) {
      setWeightMessage('Error: ' + String(err));
    } finally {
      setWeightBusy(false);
    }
  }

  const hasAnyData = history.some((d) => Number(d.calories) > 0);
  const isInitialLoad = loading && history.length === 0;

  return (
    <div className="progress-tab">
      <div className="range-selector">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            className={`range-btn ${days === r ? 'active' : ''}`}
            onClick={() => setDays(r)}
          >
            {r} days
          </button>
        ))}
      </div>

      {isInitialLoad && <p className="progress-empty">Loading your history...</p>}
      {!isInitialLoad && error && <p className="form-message error">{error}</p>}
      {!isInitialLoad && !error && !hasAnyData && (
        <p className="progress-empty">
          No meals logged yet in this range — log a meal to start building your history.
        </p>
      )}
      {!isInitialLoad && !error && hasAnyData && (
        <div className={`progress-charts${loading ? ' is-refetching' : ''}`}>
          <TrendChart
            title="Calories"
            data={history}
            series={[{ key: 'calories', label: 'Calories', color: 'var(--accent)' }]}
            goal={calorieGoal ? { value: calorieGoal, label: `Goal: ${calorieGoal.toLocaleString()} kcal` } : undefined}
          />
          <TrendChart
            title="Macros (g)"
            data={history}
            series={[
              { key: 'protein', label: 'Protein', color: 'var(--chart-series-1)' },
              { key: 'carbs', label: 'Carbs', color: 'var(--chart-series-2)' },
              { key: 'fat', label: 'Fat', color: 'var(--chart-series-3)' },
            ]}
          />
          <TrendChart
            title="Pet mood score"
            data={history}
            series={[{ key: 'moodScore', label: 'Mood score', color: 'var(--accent)' }]}
            yMax={100}
          />
        </div>
      )}

      <div className="weight-section">
        <h3>Weight</h3>
        {weightHistory.length > 0 ? (
          <TrendChart
            title="Weight (kg)"
            data={weightHistory}
            series={[{ key: 'weightKg', label: 'Weight', color: 'var(--accent)' }]}
            goal={goalWeightKg ? { value: goalWeightKg, label: `Goal: ${goalWeightKg} kg` } : undefined}
            yFormat={(v) => v.toFixed(1)}
          />
        ) : (
          <p className="progress-empty">No weigh-ins logged yet in this range.</p>
        )}

        <div className="weight-forms">
          <form className="weight-form" onSubmit={handleLogWeight}>
            <label className="field">
              <span>Log today's weight (kg)</span>
              <input
                type="number"
                placeholder="e.g. 78.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                min={20}
                max={300}
                step={0.1}
              />
            </label>
            <button className="secondary-btn" type="submit" disabled={weightBusy || !weightInput}>
              Log weight
            </button>
          </form>

          <form className="weight-form" onSubmit={handleSetGoal}>
            <label className="field">
              <span>{goalWeightKg ? `Goal weight: ${goalWeightKg} kg` : 'Set a goal weight (kg)'}</span>
              <input
                type="number"
                placeholder="e.g. 72"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                min={20}
                max={300}
                step={0.1}
              />
            </label>
            <button className="secondary-btn" type="submit" disabled={weightBusy || !goalInput}>
              {goalWeightKg ? 'Update goal' : 'Set goal'}
            </button>
          </form>
        </div>

        {weightMessage && (
          <p className={`form-message ${weightMessage.startsWith('Error') ? 'error' : 'success'}`}>{weightMessage}</p>
        )}
      </div>
    </div>
  );
}

export default ProgressTab;
