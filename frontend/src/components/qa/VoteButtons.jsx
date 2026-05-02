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

  const countTone =
    voteCount > 0 ? 'text-accent-600' :
    voteCount < 0 ? 'text-primary-400' :
    'text-primary-400';

  return (
    <div className="flex flex-col items-center shrink-0 select-none">
      <button
        onClick={(e) => handleVote(e, 1)}
        disabled={loading}
        aria-label="Upvote"
        className={`p-1 rounded-md transition-colors cursor-pointer ${
          userVote === 1
            ? 'text-accent-600 bg-accent-500/10'
            : 'text-primary-300 hover:text-accent-600 hover:bg-accent-500/10'
        }`}
      >
        <ChevronUp size={17} strokeWidth={2.2} />
      </button>

      <span className={`text-[13px] font-semibold tabular-nums leading-tight my-0.5 ${countTone}`}>
        {voteCount}
      </span>

      <button
        onClick={(e) => handleVote(e, -1)}
        disabled={loading}
        aria-label="Downvote"
        className={`p-1 rounded-md transition-colors cursor-pointer ${
          userVote === -1
            ? 'text-primary-700 bg-primary-200/60'
            : 'text-primary-300 hover:text-primary-700 hover:bg-primary-200/50'
        }`}
      >
        <ChevronDown size={17} strokeWidth={2.2} />
      </button>
    </div>
  );
}
