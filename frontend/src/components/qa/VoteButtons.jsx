import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function VoteButtons({ voteCount = 0, userVote = 0, onVote }) {
  const [loading, setLoading] = useState(false);

  const handleVote = async (e, value) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await onVote(value);
    } catch {
      // stay as-is
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <button
        onClick={(e) => handleVote(e, 1)}
        disabled={loading}
        className={`p-1 rounded-lg transition-colors ${
          userVote === 1
            ? 'text-emerald-500 bg-emerald-500/10'
            : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10'
        }`}
      >
        <ChevronUp size={18} />
      </button>

      <span className={`text-sm font-semibold tabular-nums ${
        voteCount > 0 ? 'text-emerald-500' :
        voteCount < 0 ? 'text-rose-500' :
        'text-slate-400'
      }`}>
        {voteCount}
      </span>

      <button
        onClick={(e) => handleVote(e, -1)}
        disabled={loading}
        className={`p-1 rounded-lg transition-colors ${
          userVote === -1
            ? 'text-rose-500 bg-rose-500/10'
            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10'
        }`}
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
}
