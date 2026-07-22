import { useState } from 'react';
import FoodLogForm from '../components/FoodLogForm';
import PetDisplay from '../components/PetDisplay';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [mood, setMood] = useState('neutral');
  const [moodScore, setMoodScore] = useState(50);

  function handleLogSuccess(newMood: string, newMoodScore: number) {
    setMood(newMood);
    setMoodScore(newMoodScore);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>CalCoach</h1>
        <div className="dashboard-user">
          <span>{user?.name}</span>
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="dashboard-grid">
        <section className="dashboard-card">
          <PetDisplay mood={mood} moodScore={moodScore} />
        </section>
        <section className="dashboard-card">
          <FoodLogForm userId={user!._id} onLogSuccess={handleLogSuccess} />
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
