import { useEffect, useState } from 'react';
import { API_BASE } from '../config';

type FoodLogEntry = {
  _id: string;
  foodName: string;
  calories: number;
  protein: number;
  loggedAt: string;
};

type TodaysMealsProps = {
  userId: string;
  refreshKey: number;
};

function TodaysMeals({ userId, refreshKey }: TodaysMealsProps) {
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/foodlog/${userId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, refreshKey]);

  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);

  return (
    <div className="todays-meals">
      <div className="todays-meals-header">
        <h2>Today's Meals</h2>
        {logs.length > 0 && <span className="todays-meals-total">{totalCalories.toLocaleString()} kcal</span>}
      </div>

      {loading && <p className="progress-empty">Loading...</p>}
      {!loading && logs.length === 0 && (
        <p className="progress-empty">Nothing logged yet today — add your first meal below.</p>
      )}
      {!loading && logs.length > 0 && (
        <ul className="todays-meals-list">
          {logs.map((log) => (
            <li key={log._id} className="todays-meal-item">
              <span className="todays-meal-name">{log.foodName}</span>
              <span className="todays-meal-macros">
                {log.calories} kcal{log.protein ? ` · ${log.protein}g protein` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodaysMeals;
