import { API_BASE } from '../config';

function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>CalCoach</h1>
        <p>Track your meals. Keep your buddy happy.</p>
        <button className="google-btn" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}

export default LoginPage;