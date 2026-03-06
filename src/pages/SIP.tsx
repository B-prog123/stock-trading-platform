import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { apiUrl } from '../lib/api';
import { Calendar, Clock3, PauseCircle, PlayCircle, PlusCircle, Trash2, Pencil, Activity, DollarSign, TrendingUp, History } from 'lucide-react';

interface SIPOrder {
  id: number;
  stockSymbol: string;
  investmentAmount: number;
  frequency: 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string | null;
  totalInvested: number;
  totalShares: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED';
  nextRunDate: string | null;
  lastExecutedAt: string | null;
  createdAt: string;
}

interface SIPExecution {
  id: number;
  scheduledDate: string;
  executedAt: string;
  price: number | null;
  amount: number | null;
  shares: number | null;
  status: 'SUCCESS' | 'FAILED';
  error: string | null;
}

interface SIPSummary {
  activeSips: number;
  totalInvested: number;
  totalShares: number;
  profitLoss: number;
}

const quickSymbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'];

export default function SIP() {
  const { token, logout, addNotification } = useAuth();
  const [sips, setSips] = useState<SIPOrder[]>([]);
  const [summary, setSummary] = useState<SIPSummary>({ activeSips: 0, totalInvested: 0, totalShares: 0, profitLoss: 0 });
  const [selectedSip, setSelectedSip] = useState<SIPOrder | null>(null);
  const [history, setHistory] = useState<SIPExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSipId, setEditingSipId] = useState<number | null>(null);
  const [lastNotifId, setLastNotifId] = useState(0);

  const [form, setForm] = useState({
    stockSymbol: 'AAPL',
    investmentAmount: 500,
    frequency: 'MONTHLY' as 'WEEKLY' | 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  useEffect(() => {
    fetchDashboard();
    fetchNotifications(0);

    const interval = setInterval(() => {
      fetchNotifications(lastNotifId);
      fetchDashboard(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [token, lastNotifId]);

  const activeCount = useMemo(() => sips.filter((s) => s.status === 'ACTIVE').length, [sips]);

  const fetchDashboard = async (withLoader = true) => {
    if (withLoader) setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/sip/dashboard'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSips(data.sips || []);
        setSummary(data.summary || { activeSips: 0, totalInvested: 0, totalShares: 0, profitLoss: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch SIP dashboard', error);
    } finally {
      if (withLoader) setLoading(false);
    }
  };

  const fetchDetails = async (sipId: number) => {
    try {
      const res = await fetch(apiUrl(`/api/sip/${sipId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSelectedSip(data.sip);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch SIP details', error);
    }
  };

  const fetchNotifications = async (afterId: number) => {
    try {
      const res = await fetch(apiUrl(`/api/sip/notifications?afterId=${afterId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) return;

      let maxId = afterId;
      for (const row of rows) {
        maxId = Math.max(maxId, row.id);
        const title = row.type === 'FAILED' ? 'SIP Failed' : row.type === 'COMPLETED' ? 'SIP Completed' : 'SIP Executed';
        const tone = row.type === 'FAILED' ? 'error' : row.type === 'COMPLETED' ? 'info' : 'success';
        addNotification(title, row.message, tone);
      }
      setLastNotifId(maxId);

      await fetch(apiUrl('/api/sip/notifications/read'), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to poll SIP notifications', error);
    }
  };

  const resetForm = () => {
    setForm({
      stockSymbol: 'AAPL',
      investmentAmount: 500,
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setEditingSipId(null);
  };

  const submitSIP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      stockSymbol: form.stockSymbol.trim().toUpperCase(),
      investmentAmount: Number(form.investmentAmount),
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || null,
    };

    try {
      const endpoint = editingSipId ? `/api/sip/${editingSipId}` : '/api/sip';
      const method = editingSipId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        addNotification('SIP Save Failed', data.error || 'Could not save SIP plan.', 'error');
        return;
      }

      addNotification(editingSipId ? 'SIP Updated' : 'SIP Created', `${payload.stockSymbol} SIP has been saved.`, 'success');
      resetForm();
      fetchDashboard();
      if (selectedSip?.id === editingSipId) {
        fetchDetails(editingSipId!);
      }
    } catch (error) {
      console.error('Save SIP error', error);
      addNotification('SIP Save Failed', 'Network error while saving SIP.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const editSip = (sip: SIPOrder) => {
    setEditingSipId(sip.id);
    setForm({
      stockSymbol: sip.stockSymbol,
      investmentAmount: sip.investmentAmount,
      frequency: sip.frequency,
      startDate: sip.startDate,
      endDate: sip.endDate || '',
    });
  };

  const setSipStatus = async (sipId: number, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    try {
      const res = await fetch(apiUrl(`/api/sip/${sipId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addNotification('SIP Update Failed', data.error || 'Failed to update SIP status.', 'error');
        return;
      }

      addNotification('SIP Updated', `SIP is now ${status.toLowerCase()}.`, 'success');
      fetchDashboard(false);
      if (selectedSip?.id === sipId) fetchDetails(sipId);
    } catch (error) {
      console.error('SIP status update error', error);
      addNotification('SIP Update Failed', 'Network error updating SIP status.', 'error');
    }
  };

  const cancelSip = async (sipId: number) => {
    try {
      const res = await fetch(apiUrl(`/api/sip/${sipId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addNotification('Cancel Failed', data.error || 'Failed to cancel SIP.', 'error');
        return;
      }

      addNotification('SIP Cancelled', 'The SIP plan has been cancelled.', 'warning');
      fetchDashboard(false);
      if (selectedSip?.id === sipId) {
        setSelectedSip(null);
        setHistory([]);
      }
    } catch (error) {
      console.error('Cancel SIP error', error);
      addNotification('Cancel Failed', 'Network error while cancelling SIP.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-bold">Systematic Investment Plan (SIP)</h1>
        <p className="text-[var(--text-secondary)] mt-1">Automate weekly or monthly stock investing with tracking and execution history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Activity size={18} />} label="Active SIPs" value={String(activeCount || summary.activeSips)} />
        <StatCard icon={<DollarSign size={18} />} label="Total Invested" value={`$${(summary.totalInvested || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <StatCard icon={<TrendingUp size={18} />} label="Total Shares" value={(summary.totalShares || 0).toFixed(4)} />
        <StatCard icon={<History size={18} />} label="Profit / Loss" value={`${summary.profitLoss >= 0 ? '+' : ''}$${(summary.profitLoss || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} tone={summary.profitLoss >= 0 ? 'up' : 'down'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={submitSIP} className="xl:col-span-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PlusCircle size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold">{editingSipId ? 'Edit SIP' : 'Create SIP'}</h2>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Stock Symbol</label>
            <input
              type="text"
              value={form.stockSymbol}
              onChange={(e) => setForm((p) => ({ ...p, stockSymbol: e.target.value.toUpperCase() }))}
              className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 outline-none focus:border-emerald-500/40"
              required
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {quickSymbols.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setForm((p) => ({ ...p, stockSymbol: s }))}
                  className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs hover:border-emerald-500/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Investment Amount ($)</label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={form.investmentAmount}
              onChange={(e) => setForm((p) => ({ ...p, investmentAmount: Number(e.target.value) }))}
              className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 outline-none focus:border-emerald-500/40"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Frequency</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['WEEKLY', 'MONTHLY'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, frequency: freq }))}
                  className={`rounded-xl px-3 py-2 text-sm border transition-colors ${form.frequency === freq ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'border-[var(--border-color)]'}`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 outline-none focus:border-emerald-500/40"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">End Date (Optional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-emerald-500 text-black font-semibold py-2.5 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingSipId ? 'Update SIP' : 'Create SIP'}
            </button>
            {editingSipId && (
              <button type="button" onClick={resetForm} className="rounded-xl border border-[var(--border-color)] px-3 py-2.5 text-sm">
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="xl:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-lg font-semibold">SIP Dashboard</h2>
            <span className="text-xs text-[var(--text-secondary)]">{sips.length} plans</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Freq</th>
                  <th className="px-4 py-3">Invested</th>
                  <th className="px-4 py-3">Shares</th>
                  <th className="px-4 py-3">Next Run</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-secondary)]">Loading SIP plans...</td>
                  </tr>
                ) : sips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-secondary)]">No SIP plans yet.</td>
                  </tr>
                ) : (
                  sips.map((sip) => (
                    <tr key={sip.id} className="border-t border-[var(--border-color)] hover:bg-[var(--bg-primary)]/40">
                      <td className="px-4 py-3 font-semibold">{sip.stockSymbol}</td>
                      <td className="px-4 py-3 font-mono">${sip.investmentAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">{sip.frequency}</td>
                      <td className="px-4 py-3 font-mono">${(sip.totalInvested || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono">{(sip.totalShares || 0).toFixed(4)}</td>
                      <td className="px-4 py-3">{sip.nextRunDate || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          sip.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400' :
                          sip.status === 'PAUSED' ? 'bg-amber-500/15 text-amber-400' :
                          sip.status === 'COMPLETED' ? 'bg-cyan-500/15 text-cyan-400' :
                          'bg-rose-500/15 text-rose-400'
                        }`}>
                          {sip.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <button onClick={() => fetchDetails(sip.id)} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs">View</button>
                          <button onClick={() => editSip(sip)} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs"><Pencil size={12} /></button>
                          {sip.status === 'ACTIVE' ? (
                            <button onClick={() => setSipStatus(sip.id, 'PAUSED')} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs"><PauseCircle size={12} /></button>
                          ) : sip.status === 'PAUSED' ? (
                            <button onClick={() => setSipStatus(sip.id, 'ACTIVE')} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs"><PlayCircle size={12} /></button>
                          ) : null}
                          {sip.status !== 'CANCELLED' && (
                            <button onClick={() => cancelSip(sip.id)} className="px-2 py-1 rounded-md border border-red-500/40 text-red-400 text-xs"><Trash2 size={12} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSip && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">SIP Details: {selectedSip.stockSymbol}</h3>
              <p className="text-xs text-[var(--text-secondary)]">Started {selectedSip.startDate} {selectedSip.endDate ? ` | Ends ${selectedSip.endDate}` : ''}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1"><Clock3 size={14} /> {selectedSip.frequency}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Next: {selectedSip.nextRunDate || '-'}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Executed At</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Shares</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-secondary)]">No execution history yet.</td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--border-color)]">
                      <td className="px-4 py-3">{row.scheduledDate}</td>
                      <td className="px-4 py-3">{row.executedAt ? new Date(row.executedAt).toLocaleString() : '-'}</td>
                      <td className="px-4 py-3 font-mono">{row.price ? `$${row.price.toFixed(2)}` : '-'}</td>
                      <td className="px-4 py-3 font-mono">{row.amount ? `$${row.amount.toFixed(2)}` : '-'}</td>
                      <td className="px-4 py-3 font-mono">{row.shares ? row.shares.toFixed(6) : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${row.status === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{row.error || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, tone = 'neutral' }: { icon: React.ReactNode; label: string; value: string; tone?: 'neutral' | 'up' | 'down' }) {
  const toneClass = tone === 'up' ? 'text-emerald-400' : tone === 'down' ? 'text-rose-400' : 'text-[var(--text-primary)]';

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--text-secondary)] text-xs uppercase tracking-widest">{label}</span>
        <span className="text-emerald-400">{icon}</span>
      </div>
      <p className={`text-xl font-mono font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}






