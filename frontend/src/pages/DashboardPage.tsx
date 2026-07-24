import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FoodLogForm, { type LogSuccessResult } from '../components/FoodLogForm';
import PetDisplay from '../components/PetDisplay';
import ProgressTab from '../components/ProgressTab';
import ShopTab from '../components/ShopTab';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

type Tab = 'log' | 'progress' | 'shop';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [mood, setMood] = useState('neutral');
  const [moodScore, setMoodScore] = useState(50);
  const [reaction, setReaction] = useState<'good' | 'neutral' | 'bad' | null>(null);
  const [reactionKey, setReactionKey] = useState(0);
  const [coins, setCoins] = useState(0);
  const [petName, setPetName] = useState('Binky');
  const [equippedBackground, setEquippedBackground] = useState('meadow');
  const [equippedFurniture, setEquippedFurniture] = useState<string[]>([]);
  const [loginBonusNotice, setLoginBonusNotice] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('log');
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

  // Load the pet's actual saved state so it doesn't reset to a default
  // mood every time the dashboard mounts (e.g. on a fresh login).
  useEffect(() => {
    fetch(`${API_BASE}/api/foodlog/petstate/${user!._id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.petState) {
          setMood(data.petState.mood);
          setMoodScore(data.petState.moodScore);
          setPetName(data.petState.petName || 'Binky');
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load coins + equipped items so the scene looks right immediately,
  // even before the user visits the Shop tab this session.
  useEffect(() => {
    fetch(`${API_BASE}/api/shop/state/${user!._id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setCoins(data.coins);
        setEquippedBackground(data.equippedBackground);
        setEquippedFurniture(data.equippedFurniture);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Claim the once-per-day login bonus.
  useEffect(() => {
    fetch(`${API_BASE}/api/shop/claim-daily`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user!._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.awarded) {
          setCoins(data.coins);
          setLoginBonusNotice(data.coinsAwarded);
          setTimeout(() => setLoginBonusNotice(null), 4000);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogSuccess(result: LogSuccessResult) {
    setMood(result.mood);
    setMoodScore(result.moodScore);
    setReaction(result.mealQuality);
    setReactionKey((k) => k + 1);
    setCoins((c) => c + result.coinsAwarded);
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
          <span className="coin-badge">🪙 {coins}</span>
          <span>{user?.name}</span>
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {loginBonusNotice !== null && (
        <div className="banner banner-success">Welcome back! +{loginBonusNotice} coins daily login bonus.</div>
      )}
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

      <div className="pet-nameplate-wrap">
        <span className="pet-nameplate">🐾 {petName}</span>
      </div>

      <section className="pet-hero">
        <PetDisplay
          mood={mood}
          moodScore={moodScore}
          reaction={reaction}
          reactionKey={reactionKey}
          background={equippedBackground}
          furniture={equippedFurniture}
        />
      </section>

      <nav className="dashboard-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          Log Food
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          Shop
        </button>
      </nav>

      {activeTab === 'log' && (
        <main className="dashboard-grid dashboard-grid-single">
          <section className="dashboard-card">
            <FoodLogForm userId={user!._id} onLogSuccess={handleLogSuccess} />
          </section>
        </main>
      )}

      {activeTab === 'progress' && (
        <main className="dashboard-grid dashboard-grid-single">
          <section className="dashboard-card">
            <ProgressTab userId={user!._id} calorieGoal={user?.dailyCalorieGoal} />
          </section>
        </main>
      )}

      {activeTab === 'shop' && (
        <main className="dashboard-grid dashboard-grid-single">
          <section className="dashboard-card">
            <ShopTab
              userId={user!._id}
              onStateChange={(state) => {
                setCoins(state.coins);
                setEquippedBackground(state.equippedBackground);
                setEquippedFurniture(state.equippedFurniture);
              }}
            />
          </section>
        </main>
      )}
    </div>
  );
}

export default DashboardPage;
