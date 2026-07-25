import { useEffect, useState } from 'react';
import { API_BASE } from '../config';

type WaterTrackerProps = {
  userId: string;
};

function WaterTracker({ userId }: WaterTrackerProps) {
  const [cups, setCups] = useState(0);
  const [goal, setGoal] = useState(8);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/water/${userId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setCups(data.cups);
        setGoal(data.goal);
      })
      .catch(() => {});
  }, [userId]);

  async function addCup() {
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/water`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!data.error) setCups(data.cups);
    } finally {
      setBusy(false);
    }
  }

  async function undoCup() {
    if (cups === 0) return;
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/water/undo`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!data.error) setCups(data.cups);
    } finally {
      setBusy(false);
    }
  }

  const filled = Math.min(cups, goal);
  const cupIcons = Array.from({ length: goal }, (_, i) => i < filled);

  return (
    <div className="water-tracker">
      <div className="water-tracker-header">
        <h2>Water</h2>
        <span className="water-tracker-count">
          {cups} / {goal} cups
        </span>
      </div>

      <div className="water-cups">
        {cupIcons.map((isFull, i) => (
          <span key={i} className={`water-cup ${isFull ? 'is-full' : ''}`} aria-hidden="true">
            💧
          </span>
        ))}
      </div>

      <div className="water-tracker-actions">
        <button type="button" className="secondary-btn" onClick={undoCup} disabled={busy || cups === 0}>
          − Undo
        </button>
        <button type="button" className="primary-btn" onClick={addCup} disabled={busy}>
          + Add Cup
        </button>
      </div>
    </div>
  );
}

export default WaterTracker;
