import React, { useState } from 'react';
import { Wallet, CheckCircle2, XCircle, Loader2, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../App';

type DepositState = 'idle' | 'processing' | 'success' | 'failed';

export default function Funds() {
  const { deposit } = useAuth();

  const [depositAmount, setDepositAmount] = useState('1000');
  const [depositState, setDepositState] = useState<DepositState>('idle');
  const [depositError, setDepositError] = useState('');

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setDepositError('Enter a valid amount greater than 0.');
      return;
    }

    try {
      setDepositError('');
      setDepositState('processing');
      await deposit(amount);
      setDepositState('success');
    } catch {
      setDepositState('failed');
      setDepositError('Unable to process deposit right now.');
    }
  };

  const resetDeposit = () => {
    setDepositState('idle');
    setDepositError('');
    setDepositAmount('1000');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border-emerald-500/20">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Landmark className="text-emerald-400" size={28} />
          Add Funds
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Deposit directly to your wallet balance.</p>
      </div>

      <div className="glass-card p-6 md:p-8 max-w-3xl">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold ml-1">Amount (INR)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl py-4 px-6 text-2xl font-mono font-bold text-center focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['500', '1000', '5000'].map((amt) => (
              <button
                key={amt}
                onClick={() => setDepositAmount(amt)}
                className="py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold hover:border-emerald-500/50 transition-all text-[var(--text-primary)]"
              >
                INR {amt}
              </button>
            ))}
          </div>

          <button
            onClick={handleDeposit}
            disabled={depositState === 'processing'}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {depositState === 'processing' ? <Loader2 className="animate-spin" size={18} /> : <Wallet size={18} />}
            {depositState === 'processing' ? 'Processing...' : 'Deposit Funds'}
          </button>

          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-xs flex items-center gap-2 text-[var(--text-secondary)]">
            {depositState === 'processing' ? <Loader2 size={14} className="animate-spin text-cyan-400" /> : null}
            {depositState === 'success' ? <CheckCircle2 size={14} className="text-emerald-400" /> : null}
            {depositState === 'failed' ? <XCircle size={14} className="text-red-400" /> : null}
            <span>
              Payment Status: <span className="font-semibold text-[var(--text-primary)]">{depositState === 'idle' ? 'Ready' : depositState === 'processing' ? 'Processing' : depositState === 'success' ? 'Success' : 'Failed'}</span>
            </span>
          </div>

          {depositError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{depositError}</div>}

          <button onClick={resetDeposit} className="w-full py-3 text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl">Reset</button>
        </div>
      </div>
    </motion.div>
  );
}
