import React, { useState, useEffect } from 'react';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { TwoFactorView } from './components/TwoFactorView';
import { DashboardView } from './components/DashboardView';

interface Message {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [screen, setScreen] = useState<'loading' | 'login' | 'register' | 'mfa' | 'dashboard'>('loading');
  const [user, setUser] = useState<{ userId: string; username: string; email: string } | null>(null);
  const [mfaState, setMfaState] = useState<{ userId: string; username: string; simulatedOtp?: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to add dynamic alerts
  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 11);
    setMessages((prev) => [...prev, { id, text, type }]);

    // Auto dismiss after 8 seconds to allow thorough inspection of security logs
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 8500);
  };

  // Synchronize dynamic user status on load
  const syncStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const res = await response.json();

      if (res.success && res.authenticated && res.data) {
        setUser(res.data);
        setScreen('dashboard');
      } else if (res.success && res.mfaRequired && res.userId) {
        // Prompt MFA redirection if half authenticated
        setMfaState({ userId: res.userId, username: 'authorized_node' });
        setScreen('mfa');
      } else {
        setScreen('login');
      }
    } catch (err) {
      setScreen('login');
    }
  };

  useEffect(() => {
    syncStatus();
  }, []);

  const handleLoginSuccess = (data: { userId: string; username: string; mfaRequired: boolean; simulatedOtp?: string }) => {
    if (data.mfaRequired) {
      setMfaState({
        userId: data.userId,
        username: data.username,
        simulatedOtp: data.simulatedOtp,
      });
      setScreen('mfa');
    } else {
      syncStatus();
    }
  };

  const handleRegisterSuccess = (mfaSetupCode: string) => {
    // Navigate straight to handshake credentials to log in!
    setScreen('login');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setMfaState(null);
      setScreen('login');
      showMessage('Clearance session discarded safely. Connection terminated.', 'info');
    } catch (err) {
      showMessage('Error resetting connection parameters.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-x-hidden flex flex-col justify-between cyber-grid">
      {/* Dynamic atmospheric ambient glows in background */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Persistent Security Header bar */}
      <header className="border-b border-outline/10 bg-surface-container/30 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => screen !== 'dashboard' && setScreen('login')}>
            <span className="material-symbols-outlined text-primary text-3xl font-medium" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
            <span className="font-sans font-extrabold text-lg text-white uppercase tracking-widest">
              Fortress <span className="text-primary font-normal">Logic</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant">
            {screen === 'dashboard' && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary pulse-indicator"></div>
                <span className="text-primary uppercase font-bold tracking-widest text-[10px]">Secure Bridge Online</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">wifi_secure</span>
              <span>ENC: <strong className="text-secondary font-bold">AES_GCM_256</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container viewport */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 z-20">
        {screen === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <span className="material-symbols-outlined text-primary text-6xl animate-spin">
              progress_activity
            </span>
            <p className="text-xs font-mono uppercase tracking-widest text-outline">
              Initializing Secure Handshake Protocols...
            </p>
          </div>
        )}

        {screen === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setScreen('register')}
            showMessage={showMessage}
          />
        )}

        {screen === 'register' && (
          <RegisterView
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setScreen('login')}
            showMessage={showMessage}
          />
        )}

        {screen === 'mfa' && mfaState && (
          <TwoFactorView
            userId={mfaState.userId}
            username={mfaState.username}
            initialOtp={mfaState.simulatedOtp}
            onVerifySuccess={syncStatus}
            onBackToLogin={() => {
              setMfaState(null);
              setScreen('login');
            }}
            showMessage={showMessage}
          />
        )}

        {screen === 'dashboard' && user && (
          <DashboardView
            user={user}
            onLogout={handleLogout}
            showMessage={showMessage}
          />
        )}
      </main>

      {/* Beautiful Dynamic Alert Central Banner Station (Toasts) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg shadow-2xl backdrop-blur-lg border text-xs flex items-start gap-3 transition-all duration-500 animate-slide-in relative overflow-hidden ${
              msg.type === 'success'
                ? 'bg-tertiary-container/80 border-tertiary text-tertiary'
                : msg.type === 'error'
                ? 'bg-error-container/80 border-error text-error'
                : 'bg-primary-container/80 border-primary text-primary'
            }`}
          >
            {/* Sliding laser charge visual effect */}
            <div className={`absolute bottom-0 left-0 h-1 transition-all ${
              msg.type === 'success' ? 'bg-tertiary' : msg.type === 'error' ? 'bg-error' : 'bg-primary'
            } animate-laser`} style={{ width: '100%' }}></div>

            <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">
              {msg.type === 'success' ? 'check_circle' : msg.type === 'error' ? 'error' : 'info'}
            </span>
            <div className="flex-grow leading-relaxed">
              <p className="font-bold uppercase tracking-wider mb-0.5">
                {msg.type === 'success' ? 'Handshake Clearance Approved' : msg.type === 'error' ? 'Security Handshake Rejected' : 'System Intel Broadcast'}
              </p>
              <p className="text-on-surface-variant font-light">{msg.text}</p>
            </div>
            <button
              onClick={() => setMessages((prev) => prev.filter((m) => m.id !== msg.id))}
              className="text-on-surface-variant hover:text-white transition-colors cursor-pointer self-start"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>

      {/* Secure footer console */}
      <footer className="border-t border-outline/10 py-6 bg-surface-container/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-outline font-mono">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">terminal</span>
            <span>Fortress Logic console v4.19.4a-Production</span>
          </div>
          <div>
            <span>© 2026 Fortress Logic System Holdings, LLC. All clearance levels protected.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
