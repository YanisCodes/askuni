import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import SessionCard from '../../components/sessions/SessionCard';

export default function BrowseSessionsPage() {
  const { sessions, modules } = useData();
  const [filterModule, setFilterModule] = useState('');

  const filteredSessions = useMemo(() => {
    if (!filterModule) return sessions;
    return sessions.filter(s => s.module?.id === Number(filterModule));
  }, [sessions, filterModule]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Sessions</h1>
        <Link to="/sessions/create">
          <Button>Create Session</Button>
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        >
          <option value="">All Modules</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users size={48} />}
          title="No study sessions yet"
          description="Create one and invite others to join!"
          action={
            <Link to="/sessions/create">
              <Button>Create Session</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
