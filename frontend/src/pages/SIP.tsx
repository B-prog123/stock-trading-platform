import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { apiUrl } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock3, PauseCircle, PlayCircle, PlusCircle, Trash2, Pencil, Activity, DollarSign, TrendingUp, History, Sparkles } from 'lucide-react';

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

const quickSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN'];

const sipIdeas = [
  { name: 'Safe Bluechip', symbol: 'RELIANCE', desc: 'Consistent large-cap growth', amount: 1000, tag: 'Low Risk' },
  { name: 'High Growth IT', symbol: 'TCS', desc: 'Capitalize on tech & AI', amount: 500, tag: 'High Growth' },
  { name: 'Financial Core', symbol: 'HDFCBANK', desc: 'Banking sector stability', amount: 750, tag: 'Moderate Risk' },
];

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
    stockSymbol: 'RELIANCE',
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
      stockSymbol: 'RELIANCE',
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

      const res = await fetch(apiUrl(endpoint), {
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

  const generateProjectionData = () => {
    let currentVal = 0;
    let invested = 0;
    const data = [];
    const monthlyRate = 0.12 / 12; // Assume 12% annual return for projection
    const nofMonths = 120; // 10 years projection

    const monthlyContribution = form.frequency === 'WEEKLY' ? form.investmentAmount * 4.33 : form.investmentAmount;

    for (let i = 0; i <= nofMonths; i += 12) {
      data.push({
        year: `Year ${i / 12}`,
        invested: Math.round(invested),
        projected: Math.round(currentVal)
      });
      for (let j = 0; j < 12; j++) {
        invested += monthlyContribution;
        currentVal = (currentVal + monthlyContribution) * (1 + monthlyRate);
      }
    }
    return data;
  };

  const projectionData = generateProjectionData();

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

        {/* Left Column: Form & Graph */}
        <div className="xl:col-span-1 space-y-6">
          <form onSubmit={submitSIP} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                <PlusCircle size={18} className="text-emerald-500" />
                {editingSipId ? 'Edit SIP' : 'Create New SIP'}
              </h2>
            </div>
            <div className="p-5 space-y-5">
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

            </div>

            <div className="flex items-center gap-2 pt-2 px-5 pb-5">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-emerald-500 text-black font-semibold py-2.5 disabled:opacity-50 transition-colors hover:bg-emerald-400"
              >
                {saving ? 'Saving...' : editingSipId ? 'Update SIP' : 'Initialize SIP'}
              </button>
              {editingSipId && (
                <button type="button" onClick={resetForm} className="rounded-lg border border-[var(--border-color)] px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Projection Graph */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--text-primary)]">Wealth Projection <span className="text-[10px] font-normal text-[var(--text-secondary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded">@{12}% p.a.</span></h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Estimated 10-year growth based on current input.</p>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 0, left: -20, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="projected" name="Projected Value" stroke="#10b981" fillOpacity={1} fill="url(#colorProjected)" />
                  <Area type="monotone" dataKey="invested" name="Amount Invested" stroke="#64748b" fill="none" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: SIP Dashboard & Ideas */}
        <div className="xl:col-span-2 space-y-6">

          {/* Preset Ideas */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-[var(--text-primary)]">
              <Sparkles size={16} className="text-indigo-400" />
              Popular SIP Ideas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sipIdeas.map((idea) => (
                <div key={idea.name} className="border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-lg p-4 hover:border-emerald-500/30 transition-colors group cursor-pointer" onClick={() => {
                  setForm(p => ({ ...p, stockSymbol: idea.symbol, investmentAmount: idea.amount }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{idea.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-secondary)] border border-[var(--border-color)] rounded px-1.5 py-0.5">{idea.tag}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mb-3">{idea.desc}</div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-mono font-semibold">${idea.amount} <span className="text-[10px] text-[var(--text-secondary)] font-sans">/mo</span></span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Select</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-tertiary)]">
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
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${sip.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400' :
                            sip.status === 'PAUSED' ? 'bg-amber-500/15 text-amber-400' :
                              sip.status === 'COMPLETED' ? 'bg-cyan-500/15 text-cyan-400' :
                                'bg-rose-500/15 text-rose-400'
                            }`}>
                            {sip.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button onClick={() => fetchDetails(sip.id)} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs hover:bg-[var(--bg-tertiary)] transition-colors">View</button>
                            <button onClick={() => editSip(sip)} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs hover:bg-[var(--bg-tertiary)] transition-colors"><Pencil size={12} /></button>
                            {sip.status === 'ACTIVE' ? (
                              <button onClick={() => setSipStatus(sip.id, 'PAUSED')} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs hover:text-amber-400 transition-colors"><PauseCircle size={12} /></button>
                            ) : sip.status === 'PAUSED' ? (
                              <button onClick={() => setSipStatus(sip.id, 'ACTIVE')} className="px-2 py-1 rounded-md border border-[var(--border-color)] text-xs hover:text-emerald-400 transition-colors"><PlayCircle size={12} /></button>
                            ) : null}
                            {sip.status !== 'CANCELLED' && (
                              <button onClick={() => cancelSip(sip.id)} className="px-2 py-1 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"><Trash2 size={12} /></button>
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

        </div>
      </div>
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
