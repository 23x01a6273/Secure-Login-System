import React, { useState, useEffect } from 'react';

interface RegisterViewProps {
  onRegisterSuccess: (simulatedOtp: string) => void;
  onNavigateToLogin: () => void;
  showMessage: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  showMessage,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [strength, setStrength] = useState(0); // 0 to 4
  const [strengthLabel, setStrengthLabel] = useState('Low Security Strength');
  const [loading, setLoading] = useState(false);

  // Monitor and calculate password strength
  useEffect(() => {
    let score = 0;
    if (password.length >= 4) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    setStrength(score);

    if (score === 0 || password.length === 0) {
      setStrengthLabel('Critical Failure Minimum Length');
    } else if (score === 1) {
      setStrengthLabel('Weak Security Strength');
    } else if (score === 2) {
      setStrengthLabel('Medium Security Strength');
    } else if (score === 3) {
      setStrengthLabel('High Security Strength');
    } else {
      setStrengthLabel('Ultra Security Certified');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      showMessage('Please formulate all node requirements in full.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Master security authentication key coordinates mismatched.', 'error');
      return;
    }

    if (password.length < 8) {
      showMessage('Minimum key defense requires at least 8 digits.', 'error');
      return;
    }

    if (!agree) {
      showMessage('Authorize operational protocols and charter acknowledgement before connection.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username: fullName.toLowerCase().replace(/\s+/g, '_'),
          email,
          password,
        }),
      });

      const res = await response.json();

      if (res.success) {
        showMessage('Registration matrix established successfully!', 'success');
        onRegisterSuccess(res.data.mfaSetupCode);
      } else {
        showMessage(res.message || 'Identity link sequence rejected.', 'error');
      }
    } catch (err) {
      showMessage('Network security relay offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Column: Benefits text lists */}
      <div className="hidden lg:flex flex-col space-y-6">
        <div className="space-y-4">
          <h1 className="font-sans text-5xl text-primary leading-tight font-extrabold">
            Forge Your <br /> <span className="text-secondary">Security Identity</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-md font-light leading-relaxed">
            Join the next generation of high-performance security intelligence. Secure your assets with military-grade encryption and real-time monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-primary-container/20 border border-primary/30 text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">End-to-End Encryption</h3>
              <p className="text-xs text-on-surface-variant/80 mt-1">Your data is ciphered before it even leaves your device.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:border-secondary/40 transition-colors">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-secondary-container/20 border border-secondary/30 text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                fingerprint
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Biometric Guard</h3>
              <p className="text-xs text-on-surface-variant/80 mt-1">Integrated multi-factor authentication systems.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:border-tertiary/40 transition-colors">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-tertiary-container/20 border border-tertiary/30 text-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_with_heart
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Privacy-First Policy</h3>
              <p className="text-xs text-on-surface-variant/80 mt-1">We never sell your data. You are the sole owner of your logic.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Registration Form Panel */}
      <div className="flex justify-center lg:justify-end">
        <div className="glass-panel w-full max-w-md p-8 rounded-xl border-t-primary/30 relative overflow-hidden shadow-2xl">
          {/* Subtle background security illustrations */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <img
              referrerPolicy="no-referrer"
              alt="Security Illustration"
              className="w-32 h-32 animate-pulse"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoJgKZvftBQD98xPQkMRtXZhRMbvnFc2_VTiiwNDErZqictOrddYBl7XbwTwexZhXTvPsn6shbsj5kImcO-RpfFN-v-NNZ-dswXBjGGt768X6pv42GC-Q20KxumPzoTZGUwTfCKvWjPbj0r37mGKzeJCLTLOb_dtWRhwFWq0wOVgXQX5sCrvOBkPaiZFdo1R6RpjfQOQLKfySEy8A_8D0YMISvAAKT0FwIRUumF3Hwy1-A2i8xrVrVeQ9if_-EZVyPUve9CrmjEz0"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Create Account</h2>
            <p className="text-xs text-on-surface-variant">Start your journey into Fortress Logic.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name input component */}
            <div className="space-y-1">
              <label className="text-xs text-on-surface-variant px-1 font-semibold uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline/25 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline/40 py-3 px-4 rounded-lg outline-none transition-colors font-sans text-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Email input component */}
            <div className="space-y-1">
              <label className="text-xs text-on-surface-variant px-1 font-semibold uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline/25 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline/40 py-3 px-4 rounded-lg outline-none transition-colors font-sans text-sm"
                placeholder="j.doe@fortress.io"
              />
            </div>

            {/* Master password key component */}
            <div className="space-y-1 relative">
              <label className="text-xs text-on-surface-variant px-1 font-semibold uppercase tracking-wider">
                Master Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline/25 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline/45 py-3 px-4 rounded-lg outline-none transition-colors font-sans text-sm"
                placeholder="••••••••"
              />

              {/* Incremental password strength meter bars */}
              <div className="flex gap-1.5 mt-2">
                <div className={`password-strength-segment flex-grow h-1 rounded ${strength >= 1 ? 'active-strength bg-primary shadow-sm' : 'bg-surface-variant'}`}></div>
                <div className={`password-strength-segment flex-grow h-1 rounded ${strength >= 2 ? 'active-strength bg-primary shadow-sm' : 'bg-surface-variant'}`}></div>
                <div className={`password-strength-segment flex-grow h-1 rounded ${strength >= 3 ? 'active-strength bg-primary shadow-sm' : 'bg-surface-variant'}`}></div>
                <div className={`password-strength-segment flex-grow h-1 rounded ${strength >= 4 ? 'active-strength bg-primary shadow-sm' : 'bg-surface-variant'}`}></div>
              </div>
              <p className="text-[10px] text-primary/60 mt-1 uppercase tracking-widest font-bold">
                {strengthLabel}
              </p>
            </div>

            {/* Confirm identity key password verification coordinate */}
            <div className="space-y-1">
              <label className="text-xs text-on-surface-variant px-1 font-semibold uppercase tracking-wider">
                Confirm Identity Key
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline/25 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline/45 py-3 px-4 rounded-lg outline-none transition-colors font-sans text-sm"
                placeholder="••••••••"
              />
            </div>

            {/* Agree protocol checkbox context */}
            <div className="flex items-start gap-3 py-1">
              <input
                type="checkbox"
                id="terms"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 w-4.5 h-4.5 bg-surface-container border border-outline/30 rounded text-secondary focus:ring-secondary/30 transition-all cursor-pointer shadow-sm"
              />
              <label className="text-xs text-on-surface-variant cursor-pointer leading-tight font-light" htmlFor="terms">
                I agree to the <span className="text-primary font-normal hover:underline">Security Protocols</span> and <span className="text-primary font-normal hover:underline">Privacy Charter</span>.
              </label>
            </div>

            {/* Button registration confirmation anchor trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-container to-secondary-container hover:brightness-110 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-300 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Registering Secure Core...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Establish Connection
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              )}
            </button>
          </form>

          {/* Transfer button back to signin terminal block */}
          <div className="mt-6 text-center text-xs">
            <span className="text-on-surface-variant">Already authenticated? </span>
            <button
              onClick={onNavigateToLogin}
              className="text-secondary font-bold hover:underline"
              type="button"
            >
              Access Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
