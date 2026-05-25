import React, { useState } from 'react';

interface TwoFactorViewProps {
  userId: string;
  username: string;
  initialOtp?: string;
  onVerifySuccess: () => void;
  onBackToLogin: () => void;
  showMessage: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TwoFactorView: React.FC<TwoFactorViewProps> = ({
  userId,
  username,
  initialOtp = '',
  onVerifySuccess,
  onBackToLogin,
  showMessage,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [simulatedOtpLog, setSimulatedOtpLog] = useState<string>(initialOtp);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.trim().length < 6) {
      showMessage('Please enter the complete 6-digit access token.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });

      const res = await response.json();

      if (res.success) {
        showMessage('Clearance approved. Command bridge activated.', 'success');
        onVerifySuccess();
      } else {
        showMessage(res.message || 'Verification rejected. Mismatched token key.', 'error');
      }
    } catch (err) {
      showMessage('Security network handshake timed out.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const res = await response.json();
      if (res.success) {
        setSimulatedOtpLog(res.data.simulatedOtp);
        showMessage(`New digital token dispatched: ${res.data.simulatedOtp}`, 'success');
      } else {
        showMessage(res.message || 'Key generator offline.', 'error');
      }
    } catch (err) {
      showMessage('Failure transmitting token generator signals.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel p-8 md:p-12 rounded-xl relative overflow-hidden shadow-2xl">
        {/* Pulsing secure dynamic status node */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary pulse-indicator"></div>
          <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">
            Awaiting 2FA Verification
          </span>
        </div>

        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-secondary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <h2 className="text-2xl font-bold text-on-surface">Double Factor Portal</h2>
          <p className="text-xs text-on-surface-variant mt-2">
            Dynamic code challenge dispatched to username: <strong className="font-mono text-primary font-semibold">{username}</strong>
          </p>
        </div>

        {/* Security code dispatch telemetry notification banner */}
        {simulatedOtpLog && (
          <div className="mb-6 p-4 bg-tertiary-container/20 border border-tertiary-container/30 rounded-lg text-left relative overflow-hidden">
            <div className="scanline"></div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-xl mt-0.5">
                satellite_alt
              </span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-tertiary uppercase tracking-widest">
                  Secure Dispatch Telemetry
                </p>
                <p className="text-[11px] text-on-surface-variant font-light">
                  A verification token code was intercepted at the local console buffer node:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-surface-container px-2 py-1 rounded text-xs text-primary font-bold font-mono tracking-widest border border-outline/25">
                    {simulatedOtpLog}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCode(simulatedOtpLog);
                      showMessage('Access token filled into security console buffer.', 'info');
                    }}
                    className="text-[10px] text-secondary-fixed-dim hover:underline uppercase font-bold"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block text-center mb-2">
              Enter 6-Digit Code
            </label>
            <div className="relative">
              <input
                id="otp_code_field"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-surface-container-lowest border border-outline/30 focus:border-secondary focus:ring-1 focus:ring-secondary text-on-surface text-center font-mono text-2xl tracking-[0.6em] pl-4 py-4 rounded-lg outline-none transition-all"
                placeholder="000000"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="flex-1 py-3 bg-surface-container border border-outline/25 hover:border-secondary hover:bg-surface-container-high text-on-surface hover:text-secondary text-xs rounded-lg transition-all uppercase tracking-wider font-bold cursor-pointer"
            >
              {resending ? 'Regenerating...' : 'Resend Key'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-secondary hover:brightness-110 text-surface font-bold text-xs rounded-lg transition-all uppercase tracking-wider cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Establish link'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-outline/10 text-center">
          <button
            onClick={onBackToLogin}
            className="text-xs text-on-surface-variant hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Return to Handshake Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
