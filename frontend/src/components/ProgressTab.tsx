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
    </div>
  );
}

export default ProgressTab;
