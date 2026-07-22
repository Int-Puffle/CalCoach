import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FoodLogForm from '../components/FoodLogForm';
import PetDisplay from '../components/PetDisplay';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [mood, setMood] = useState('neutral');
  const [moodScore, setMoodScore] = useState(50);
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifiedNotice, setVerifiedNotice] = useState<'success' | 'failed' | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === '1') {
      setVerifiedNotice('success');
    } else if (verified === '0') {
      setVerifiedNotice('failed');
    }
    if (verified !== null) {
      searchParams.delete('verified');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogSuccess(newMood: string, newMoodScore: number) {
    setMood(newMood);
    setMoodScore(newMoodScore);
  }

  async function handleResendVerification() {
    setResendState('sending');
    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      setResendState(response.ok ? 'sent' : 'error');
      if (!response.ok) console.error(data.error);
    } catch {
      setResendState('error');
    }
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

      {verifiedNotice === 'success' && (
        <div className="banner banner-success">Email verified — thanks!</div>
      )}
      {verifiedNotice === 'failed' && (
        <div className="banner banner-error">
          That verification link is invalid or expired. Request a new one below.
        </div>
      )}
      {!user?.emailVerified && (
        <div className="banner banner-warning">
          <span>Please verify your email address ({user?.email}).</span>
          <button
            className="secondary-btn"
            onClick={handleResendVerification}
            disabled={resendState === 'sending' || resendState === 'sent'}
          >
            {resendState === 'sent'
              ? 'Sent!'
              : resendState === 'sending'
                ? 'Sending...'
                : 'Resend verification email'}
          </button>
        </div>
      )}

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
