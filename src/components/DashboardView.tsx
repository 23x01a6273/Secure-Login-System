import React, { useState, useEffect } from 'react';
import { ApiResponse, LoginHistoryEntry } from '../types';

interface DashboardViewProps {
  user: { userId: string; username: string; email: string };
  onLogout: () => void;
  showMessage: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onLogout,
  showMessage,
}) => {
  const [logs, setLogs] = useState<LoginHistoryEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [lockdownActive, setLockdownActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'settings'>('overview');

  // Load audit history logs from secure endpoint
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/logs');
      const data: ApiResponse<LoginHistoryEntry[]> = await res.json();
      if (data.success && data.data) {
        setLogs(data.data);
      } else {
        showMessage('Unable to fetch security logs archive.', 'error');
      }
    } catch (err) {
      showMessage('Network communication failure with secure audit database.', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  // Handle Simulated Panic Overrides
  const triggerEmergencyLockdown = async () => {
    try {
      const res = await fetch('/api/lockdown', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLockdownActive(true);
        showMessage(data.message, 'error');
        // Force logout after short tactical delay
        setTimeout(() => {
          onLogout();
        }, 5000);
      }
    } catch (err) {
      showMessage('Global lockdown sequence offline.', 'error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Dynamic Security Header Alerts */}
      {lockdownActive && (
        <div className="p-4 bg-error-container/30 border border-error/50 rounded-lg text-error flex items-center justify-between pulse-indicator">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl font-bold animate-ping">warning</span>
            <div>
              <p className="font-bold text-sm tracking-widest uppercase">EMERGENCY PROTOCOL ZERO-NINE ACTIVE</p>
              <p className="text-xs opacity-80 mt-0.5">Biometric hardware lockdown in progress. Terminating session terminal coordinates...</p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold">DISCONNECT IN PROGRESS</span>
        </div>
      )}

      {/* Main Bridge Header Controls Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8 glass-panel rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative shadow-inner">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
            <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-orange-400 border border-background"></div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-sans text-on-surface">Welcome, Commander</h2>
              <span className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded text-[10px] text-primary font-mono font-bold uppercase tracking-widest">
                Lvl 4 Admin
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono mt-1">
              System ID: <span className="text-secondary font-semibold">{user.userId}</span> • Email: <span className="font-sans text-on-surface-variant">{user.email}</span>
            </p>
          </div>
        </div>

        {/* Tactical Navigation Switches */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-primary text-surface border-primary'
                : 'bg-surface-container border-outline/15 text-on-surface hover:text-white hover:border-outline/50'
            }`}
          >
            Terminal Overview
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-primary text-surface border-primary'
                : 'bg-surface-container border-outline/15 text-on-surface hover:text-white hover:border-outline/50'
            }`}
          >
            Audit Log Registry
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-primary text-surface border-primary'
                : 'bg-surface-container border-outline/15 text-on-surface hover:text-white hover:border-outline/50'
            }`}
          >
            System Settings
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border border-error/30 bg-error-container/10 text-error hover:bg-error hover:text-surface transition-all cursor-pointer"
          >
            Disconnect Terminal
          </button>
        </div>
      </div>

      {/* Main content viewport layout split standard or tab layout */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bento Stats Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Security Shield Metric */}
              <div className="glass-card p-6 rounded-xl relative overflow-hidden">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">shield</span>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Security Shield Strength</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-on-surface">97%</span>
                  <span className="text-xs text-secondary font-bold font-mono">EXCELLENT</span>
                </div>
              </div>

              {/* Verified Session Counter */}
              <div className="glass-card p-6 rounded-xl relative overflow-hidden">
                <span className="material-symbols-outlined text-secondary text-3xl mb-4">verified_user</span>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Active Session Clearance</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-on-surface">1</span>
                  <span className="text-xs text-primary font-mono">NODE ACTIVE</span>
                </div>
              </div>

              {/* MFA Status Guard Checklist */}
              <div className="glass-card p-6 rounded-xl relative overflow-hidden">
                <span className="material-symbols-outlined text-tertiary text-3xl mb-4">gpp_maybe</span>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Integrity Protocol Guard</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-on-surface">2FA</span>
                  <span className="text-xs text-tertiary font-mono">ENFORCED</span>
                </div>
              </div>
            </div>

            {/* Core Terminal Overview Cards */}
            <div className="glass-panel p-6 md:p-8 rounded-xl space-y-6">
              <div className="flex items-center justify-between border-b border-outline/10 pb-4">
                <h3 className="font-bold text-lg text-on-surface">Core Security Clearance Audit</h3>
                <button
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="text-primary hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-sm ${loadingLogs ? 'animate-spin' : ''}`}>sync</span>
                  Refresh Logs
                </button>
              </div>

              {loadingLogs ? (
                <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                  <span className="font-mono text-xs uppercase tracking-widest">Querying Identity Archive...</span>
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center py-8 text-on-surface-variant text-sm">No activity logs recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-outline/10 text-outline text-xs uppercase tracking-wider font-bold">
                        <th className="pb-3 font-semibold">Security Checkpoint Timestamp</th>
                        <th className="pb-3 font-semibold">Location (IP)</th>
                        <th className="pb-3 font-semibold">Machine Device Client</th>
                        <th className="pb-3 font-semibold">Checkpoint Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/5 font-mono text-xs text-on-surface-variant">
                      {logs.slice(0, 5).map((entry) => (
                        <tr key={entry.id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-3.5 text-on-surface font-semibold">{entry.timestamp}</td>
                          <td className="py-3.5">{entry.location}</td>
                          <td className="py-3.5">{entry.device}</td>
                          <td className="py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${
                                entry.status === 'Authorized'
                                  ? 'bg-tertiary-container/20 border-tertiary text-tertiary'
                                  : 'bg-error-container/20 border-error text-error'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {logs.length > 5 && (
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => setActiveTab('audit')}
                        className="text-xs text-primary hover:underline uppercase font-bold"
                      >
                        Inspect all {logs.length} checkpoint entries
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column Sidebar Bento items */}
          <div className="space-y-8">
            {/* Live Terminal Controls Emergency Matrix */}
            <div className="glass-panel p-6 rounded-xl border-l-error/30 relative">
              <h3 className="font-bold text-lg text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error">gpp_bad</span>
                Terminal Sentinel Guard
              </h3>
              <p className="text-xs text-on-surface-variant font-light leading-relaxed mb-6">
                If your physical access workstation has been compromised, trigger the bio-secure emergency override. This immediately locks down neural nodes, clear local clearance cookies, and suspends system tunnels from our mainframe structure.
              </p>

              <button
                onClick={triggerEmergencyLockdown}
                disabled={lockdownActive}
                className="w-full py-4 bg-error text-surface font-bold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-error/10"
              >
                Trigger Biometric Override
              </button>
            </div>

            {/* Quick System Coordinates details card */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-outline">Terminal Secure Connection parameters</h4>
              <div className="space-y-3 font-mono text-[11px] text-on-surface-variant">
                <div className="flex justify-between border-b border-outline/5 pb-2">
                  <span>SSL PROTOCOL VERSION</span>
                  <span className="text-primary font-bold">TLS_1.3_AEAD_AESGCM</span>
                </div>
                <div className="flex justify-between border-b border-outline/5 pb-2">
                  <span>SIGNING MECHANISM</span>
                  <span className="text-on-surface font-bold">SHA_256_RSA_MGF1</span>
                </div>
                <div className="flex justify-between border-b border-outline/5 pb-2">
                  <span>TUNNEL LATENCY</span>
                  <span className="text-secondary font-bold">14.4ms (STEADY)</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>SECURE INGRESS NODE</span>
                  <span className="text-on-surface font-bold">NODE_ALPHA_ZURICH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit tab direct list view */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 md:p-8 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-outline/10 pb-4">
            <div>
              <h3 className="font-bold text-xl text-on-surface">Audit Log Registry</h3>
              <p className="text-xs text-on-surface-variant mt-1">Immutable session registration events archived by system firmware</p>
            </div>
            <button
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline/15 text-xs text-on-surface hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <span className={`material-symbols-outlined text-sm ${loadingLogs ? 'animate-spin' : ''}`}>sync</span>
              Sync Database
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-outline/10 text-outline text-xs uppercase tracking-wider font-bold">
                  <th className="pb-3 font-semibold">Checkpoint Timestamp</th>
                  <th className="pb-3 font-semibold">Event ID</th>
                  <th className="pb-3 font-semibold">Identity Node Name</th>
                  <th className="pb-3 font-semibold">Location Coordinate</th>
                  <th className="pb-3 font-semibold">Machine Client Node</th>
                  <th className="pb-3 font-semibold">Access Status Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 font-mono text-xs text-on-surface-variant">
                {logs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 text-on-surface font-semibold">{entry.timestamp}</td>
                    <td className="py-4 text-primary font-bold">{entry.id}</td>
                    <td className="py-4 font-sans text-on-surface font-medium">{entry.username}</td>
                    <td className="py-4">{entry.location}</td>
                    <td className="py-4 font-sans">{entry.device}</td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${
                          entry.status === 'Authorized'
                            ? 'bg-tertiary-container/20 border-tertiary text-tertiary'
                            : 'bg-error-container/20 border-error text-error'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System options settings tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border-r border-outline/10 pr-0 md:pr-8 space-y-3">
            <h3 className="font-bold text-lg text-on-surface">Account Settings</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Configure parameters related to security identification thresholds, biometric authentication hooks, and local cryptographic cookies.
            </p>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* MFA Settings Panel options layout */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Multi-Factor Hardware Lock</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Fortress Logic enforces Multi-Factor Handshakes for all session credentials blocks by default. Access to core grid operations terminal is restricted without authenticated dynamic tokens.
              </p>
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/15 mt-4">
                <div className="flex gap-3 items-center">
                  <span className="material-symbols-outlined text-primary">circle_notifications</span>
                  <div>
                    <h5 className="text-xs font-bold text-on-surface">Active System Enforcement</h5>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Dual layers of identity checks active</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-tertiary-container/30 border border-tertiary text-tertiary font-mono font-bold text-[10px] uppercase rounded">
                  FULLY VERIFIED
                </span>
              </div>
            </div>

            {/* Simulated trusted machines devices */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Trusted Terminal Machines</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Workstations authenticated for credential persistence and biometrics handshake. Sessions will stay active for up to 30 days without re-authenticating MFA when Remember Node is selected.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline/10 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">computer</span>
                    <div>
                      <p className="font-bold text-on-surface">Workstation_Alpha_01 (This Machine)</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">IP Checkpoint: Zurich, CH • Last Sync: Today</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-primary uppercase font-extrabold tracking-widest font-mono">Active</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline/10 text-xs opacity-65">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline text-xl">phone_iphone</span>
                    <div>
                      <p className="font-bold text-on-surface">Mobile_Client_iOS (iPhone 15 Pro)</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">IP Checkpoint: London, UK • Last Sync: 24 hrs ago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => showMessage('Unmounting trusted device key. Device has been disconnected.', 'success')}
                    className="text-[10px] text-error hover:underline uppercase font-bold"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
