import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, History } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import SessionCard from '../../components/sessions/SessionCard';

const TABS = [
  { id: 'browse', label: 'Browse' },
  { id: 'history', label: 'My History' },
]

export default function BrowseSessionsPage() {
  const { sessions, modules } = useData();
  const { user } = useAuth();
  const [tab, setTab] = useState('browse');
  const [filterModule, setFilterModule] = useState('');

  const browseSessions = useMemo(() =>
    sessions.filter(s => s.status !== 'ended'),
    [sessions]
  );

  const historySessions = useMemo(() =>
    sessions.filter(s =>
      s.status === 'ended' && s.participantIds?.includes(user?.id)
    ),
    [sessions, user?.id]
  );

  const activeSessions = tab === 'browse' ? browseSessions : historySessions;

  const filtered = useMemo(() => {
    if (!filterModule) return activeSessions;
    return activeSessions.filter(s => s.module?.id === Number(filterModule));
  }, [activeSessions, filterModule]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Study Sessions</h1>
        <Link to="/sessions/create">
          <Button>Create Session</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit mb-5">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              tab === id
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              tab === id ? 'bg-slate-100 text-slate-600' : 'bg-slate-100/60 text-slate-400'
            }`}>
              {id === 'browse' ? browseSessions.length : historySessions.length}
            </span>
          </button>
        ))}
      </div>

      {/* Module filter */}
      <div className="mb-5">
        <select
          value={filterModule}
          onChange={e => setFilterModule(e.target.value)}
          className="select-glass"
        >
          <option value="">All Modules</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {filtered.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={tab === 'browse' ? <Users size={48} /> : <History size={48} />}
          title={tab === 'browse' ? 'No upcoming sessions' : 'No sessions yet'}
          description={
            tab === 'browse'
              ? 'Create one and invite others to join!'
              : "Sessions you've attended will appear here."
          }
          action={
            tab === 'browse' && (
              <Link to="/sessions/create">
                <Button>Create Session</Button>
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
