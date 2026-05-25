import React, { useState } from 'react';

interface LoginViewProps {
  onLoginSuccess: (data: { userId: string; username: string; mfaRequired: boolean; simulatedOtp?: string }) => void;
  onNavigateToRegister: () => void;
  showMessage: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  showMessage,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberNode, setRememberNode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      showMessage('Please provide systemic identity credentials.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password, rememberNode }),
      });

      const res = await response.json();

      if (res.success) {
        onLoginSuccess(res.data);
        if (res.data.mfaRequired) {
          showMessage(`Core access code dispatched: ${res.data.simulatedOtp}`, 'info');
        } else {
          showMessage('Login authenticated successfully!', 'success');
        }
      } else {
        showMessage(res.message || 'Authentication sequence rejected.', 'error');
      }
    } catch (err) {
      showMessage('Grid signal offline. Unable to reach security mainframe.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Column: Visual branding and system summary */}
      <div className="hidden lg:flex flex-col justify-center space-y-6 pr-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            security
          </span>
          <h1 className="font-sans text-4xl text-primary font-bold tracking-tight">Fortress Logic</h1>
        </div>
        <p className="text-lg text-on-surface-variant max-w-md font-light leading-relaxed">
          Enterprise-grade security intelligence powered by neural-mesh AI. Safeguard your infrastructure with predictive threat neutralization.
        </p>
        <div className="mt-8 relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[50px] group-hover:bg-primary/30 transition-all duration-700 rounded-xl"></div>
          <img
            referrerPolicy="no-referrer"
            alt="Cybersecurity shield visual"
            className="relative rounded-xl border border-primary/20 shadow-2xl hover:brightness-110 transition-all duration-500 w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1lBsV8VbGLlouVgevpn0dC6OgDNH_jmw9LXq7_tn7Q-plkHUWs6aut-GqlJoXOu0ErKaYD8YeDO0v02pYNO-AgJwt3FT5C2WI32OJ91VYcFX6KJKoa7pQw39_LOSF-heaQKWm2ac_GwYkzwYbbqbJHKNEsrtiKP9YY3ZpjP-wom_Wjfy0JGHwpZCFT__-6TLASE8qqJzBxLeEPNMKTrwID_wIjIBMgW0SJnGciieXmY9NdIfF014ZCLLKCef_4-M8zPX9UU5qmOk"
          />
        </div>
      </div>

      {/* Right Column: Signin credentials matrix formulation */}
      <div className="flex justify-center lg:justify-end">
        <div className="glass-panel p-8 md:p-12 rounded-xl w-full max-w-md relative overflow-hidden shadow-2xl">
          {/* Ambient upper glowing node */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] pointer-events-none"></div>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">security</span>
            <h2 className="text-2xl font-bold text-primary tracking-tight">Fortress Logic</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-2">Secure Access</h2>
            <p className="text-sm text-on-surface-variant">Identify yourself to enter the command center</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Coordinate username */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="username">
                IDENTITY
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  fingerprint
                </span>
                <input
                  id="identity"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline/45 pl-12 pr-4 py-3.5 rounded-lg outline-none transition-all font-mono text-sm"
                  placeholder="Username or Email"
                />
              </div>
            </div>

            {/* Access Pass key password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="password">
                ACCESS KEY
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  key
                </span>
                <input
                  id="password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline/45 pl-12 pr-12 py-3.5 rounded-lg outline-none transition-all font-mono text-sm"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Persistence & credentials reset options */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberNode}
                  onChange={(e) => setRememberNode(e.target.checked)}
                  className="w-4.5 h-4.5 bg-surface-container border border-outline/30 rounded text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember Node
                </span>
              </label>
              <button
                type="button"
                onClick={() => showMessage('Credential recovery protocols demand physical identity security key. Consult cyber administrators.', 'info')}
                className="text-xs text-primary hover:text-secondary-fixed-dim transition-colors hover:underline"
              >
                Forgot Credentials?
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-container to-secondary-container hover:brightness-110 active:scale-[0.98] text-white font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Authenticating Node...
                  </>
                ) : (
                  <>
                    Initialize Session
                    <span className="material-symbols-outlined text-lg">bolt</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Prompt to register identity block */}
          <div className="mt-6 text-center text-xs">
            <span className="text-on-surface-variant">Don't have a systemic security code? </span>
            <button
              onClick={onNavigateToRegister}
              className="text-secondary font-bold hover:underline"
              type="button"
            >
              Request Access
            </button>
          </div>

          {/* Secure Handshake Notice */}
          <div className="mt-8 flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
            <p className="text-xs text-on-surface-variant/80 font-light leading-relaxed">
              Authentication is protected by end-to-end encryption. Session tokens expire automatically after 12 hours of inactivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
